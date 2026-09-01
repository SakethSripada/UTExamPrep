package main

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
)

func loadJSONMap[T any](t *testing.T, path string) map[string]T {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("reading %s: %v", path, err)
	}
	var out map[string]T
	if err := json.Unmarshal(data, &out); err != nil {
		t.Fatalf("parsing %s: %v", path, err)
	}
	return out
}

// TestHarnessParity pins the harness output for every question against the
// committed snapshot in testdata/harness-fixtures.json, using the reference
// solutions as input. The snapshot was originally taken from the Next.js
// TypeScript harness to prove a faithful port; it now also guards against
// accidental template edits. Run with REGEN_FIXTURES=1 to rewrite the
// snapshot after an intentional harness change.
func TestHarnessParity(t *testing.T) {
	solutions := loadJSONMap[string](t, "testdata/solutions.json")
	if os.Getenv("REGEN_FIXTURES") == "1" {
		regenerateFixtures(t, solutions)
		return
	}
	fixtures := loadJSONMap[map[string]string](t, "testdata/harness-fixtures.json")
	if len(fixtures) == 0 {
		t.Fatal("no fixtures found")
	}

	for id, want := range fixtures {
		code, ok := solutions[id]
		if !ok {
			t.Errorf("%s: fixture has no matching solution", id)
			continue
		}
		got, ok := buildHarness(id, code)
		if !ok {
			t.Errorf("%s: buildHarness returned no harness", id)
			continue
		}
		if len(got) != len(want) {
			t.Errorf("%s: got %d files, want %d", id, len(got), len(want))
		}
		for name, wantContent := range want {
			if got[name] != wantContent {
				t.Errorf("%s/%s: content differs from the TypeScript harness", id, name)
			}
		}
	}

	for _, id := range questionIDs() {
		if _, ok := buildHarness(id, "class X {}"); !ok {
			continue
		}
		if _, ok := fixtures[id]; !ok {
			t.Errorf("%s: question registered but missing from fixtures; regenerate testdata", id)
		}
	}
}

func regenerateFixtures(t *testing.T, solutions map[string]string) {
	t.Helper()
	out := map[string]map[string]string{}
	for _, id := range questionIDs() {
		code, ok := solutions[id]
		if !ok {
			t.Fatalf("%s: no reference solution; cannot regenerate fixture", id)
		}
		files, ok := buildHarness(id, code)
		if !ok {
			t.Fatalf("%s: buildHarness failed", id)
		}
		out[id] = files
	}
	data, err := json.MarshalIndent(out, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile("testdata/harness-fixtures.json", append(data, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Logf("regenerated %d fixtures", len(out))
}

func TestBuildHarnessRejectsBadIDs(t *testing.T) {
	for _, id := range []string{"", "..", "../e1-q3", "e1-q3/../e1-q4", "E1-Q3", "nope", "questions"} {
		if _, ok := buildHarness(id, "class X {}"); ok {
			t.Errorf("buildHarness(%q) unexpectedly succeeded", id)
		}
	}
}

func TestBuildHarnessSplicesCode(t *testing.T) {
	files, ok := buildHarness("e1-q5", "MARKER_SENTINEL")
	if !ok {
		t.Fatal("expected harness for e1-q5")
	}
	found := false
	for name, content := range files {
		if name == "StudentSolution.java" {
			found = true
			if !strings.Contains(content, "MARKER_SENTINEL") {
				t.Error("student code was not spliced in")
			}
			if strings.Contains(content, studentCodeMarker) {
				t.Error("marker left behind after splice")
			}
		}
	}
	if !found {
		t.Fatal("StudentSolution.java missing")
	}
}

func TestBuildHarnessForLanguagePython(t *testing.T) {
	files, ok := buildHarnessForLanguage("py-smoke", "python", "def double(value):\n    return value * 2\n")
	if !ok {
		t.Fatalf("buildHarnessForLanguage returned no Python harness")
	}
	got := files["TestRunner.py"]
	if !strings.Contains(got, "def double(value):") {
		t.Fatalf("student code was not inserted into Python harness:\n%s", got)
	}
	if strings.Contains(got, studentCodeMarker) {
		t.Fatalf("student marker was not replaced in Python harness")
	}
}

func TestBuildHarnessForLanguageRejectsWrongLanguage(t *testing.T) {
	if _, ok := buildHarnessForLanguage("py-smoke", "java", "class X {}"); ok {
		t.Fatalf("Python-only harness was returned for Java")
	}
}

func TestBuildHarnessForLanguageC(t *testing.T) {
	files, ok := buildHarnessForLanguage("c-smoke", "c", "int double_value(int value) { return value * 2; }")
	if !ok {
		t.Fatalf("buildHarnessForLanguage returned no C harness")
	}
	got := files["TestRunner.c"]
	if !strings.Contains(got, "int double_value(int value)") {
		t.Fatalf("student code was not inserted into C harness:\n%s", got)
	}
	if strings.Contains(got, studentCodeMarker) {
		t.Fatalf("student marker was not replaced in C harness")
	}
}

func TestDeclassify(t *testing.T) {
	got := declassify("public class Yak extends Critter { public class YakHelper {} }")
	want := "class Yak extends Critter { public class YakHelper {} }"
	if got != want {
		t.Errorf("declassify: got %q, want %q", got, want)
	}
	// Only the first match is replaced, mirroring JS String.replace.
	got = declassify("public class JumpingBean {} public class JumpingBean {}")
	want = "class JumpingBean {} public class JumpingBean {}"
	if got != want {
		t.Errorf("declassify first-only: got %q, want %q", got, want)
	}
}
