package main

import (
	"embed"
	"encoding/json"
	"regexp"
	"strings"
)

// Each directory under questions/ holds the harness files for one question.
// Exactly one file contains studentCodeMarker, which is replaced with the
// submitted code. An optional manifest.json selects a code transform.
// The directories are generated from the original Next.js harness by
// testdata/generate-question-templates.mjs; harness_test.go verifies the
// built output byte-for-byte against testdata/harness-fixtures.json.
//
//go:embed questions
var questionsFS embed.FS

const studentCodeMarker = "// __STUDENT_CODE__"

var (
	questionIDPattern = regexp.MustCompile(`^[a-z0-9][a-z0-9-]{0,99}$`)
	declassifyPattern = regexp.MustCompile(`public\s+class\s+(Yak|JumpingBean)\b`)
)

type questionManifest struct {
	Transform string `json:"transform"`
}

// declassify removes the public modifier from the first declaration of the
// critter classes so they can live alongside the public test classes in one
// compilation unit. Mirrors the original harness, which replaced only the
// first match.
func declassify(code string) string {
	loc := declassifyPattern.FindStringSubmatchIndex(code)
	if loc == nil {
		return code
	}
	return code[:loc[0]] + "class " + code[loc[2]:loc[3]] + code[loc[1]:]
}

// buildHarness returns the Java source files for a question with the
// student's code spliced in, or false if the question has no tests.
func buildHarness(questionID, code string) (map[string]string, bool) {
	return buildHarnessForLanguage(questionID, "java", code)
}

func buildHarnessForLanguage(questionID, language, code string) (map[string]string, bool) {
	if !questionIDPattern.MatchString(questionID) {
		return nil, false
	}
	if language != "java" && language != "python" && language != "c" {
		return nil, false
	}
	dir := "questions/" + questionID
	entries, err := questionsFS.ReadDir(dir)
	if err != nil {
		return nil, false
	}

	if data, err := questionsFS.ReadFile(dir + "/manifest.json"); err == nil {
		var manifest questionManifest
		if err := json.Unmarshal(data, &manifest); err != nil {
			return nil, false
		}
		if manifest.Transform == "declassify" {
			code = declassify(code)
		}
	}

	files := make(map[string]string, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || entry.Name() == "manifest.json" {
			continue
		}
		ext := ""
		if dot := strings.LastIndexByte(entry.Name(), '.'); dot >= 0 {
			ext = entry.Name()[dot+1:]
		}
		if language == "java" && ext != "java" {
			continue
		}
		if language == "python" && ext != "py" {
			continue
		}
		if language == "c" && ext != "c" && ext != "h" {
			continue
		}
		data, err := questionsFS.ReadFile(dir + "/" + entry.Name())
		if err != nil {
			return nil, false
		}
		files[entry.Name()] = strings.Replace(string(data), studentCodeMarker, code, 1)
	}
	if len(files) == 0 {
		return nil, false
	}
	return files, true
}

// questionIDs lists every question with a registered harness.
func questionIDs() []string {
	entries, err := questionsFS.ReadDir("questions")
	if err != nil {
		return nil
	}
	ids := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			ids = append(ids, entry.Name())
		}
	}
	return ids
}
