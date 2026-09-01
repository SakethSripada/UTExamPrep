def check(label, expected, actual):
    if expected == actual:
        print(f"PASS {label} expected={expected!r} actual={actual!r}")
        return 1
    print(f"FAIL {label} expected={expected!r} actual={actual!r}")
    return 0


// __STUDENT_CODE__

passed = 0
total = 2
passed += check("double small", 8, double(4))
passed += check("double negative", -6, double(-3))
print(f"RESULT {passed}/{total}")
