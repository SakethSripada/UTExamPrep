#include <stdio.h>

// __STUDENT_CODE__

int main(void) {
    int passed = 0;
    int total = 4;
    if (double_value(0) == 0) passed++;
    if (double_value(2) == 4) passed++;
    if (double_value(-3) == -6) passed++;
    if (double_value(1000000) == 2000000) passed++;
    printf("RESULT %d/%d\n", passed, total);
    return passed == total ? 0 : 1;
}
