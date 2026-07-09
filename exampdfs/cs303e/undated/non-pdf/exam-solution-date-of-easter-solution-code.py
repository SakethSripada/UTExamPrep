# Assignment: HW2
# File: EasterSunday.py
# Student: Bill Young 
# UT EID: youngwd
# Course Name: CS303E
# 
# Date: September 16, 2024 

# Description of Program: Given a year, compute the date Easter falls
#   that year.  We use an algorithm due to Gauss.

def main():
    # Get from the user a year. Assume the user input is a string
    # representing a positive integer.
    y = int( input( "Enter year: " ))
    # print("y =", y)

    # The code only works for years after 1752.  Check for that to 
    # make the program more robust.
    if y < 1753:
        print("Sorry, you need a year after 1752.")
        return

    # Divide y by 19 and call the remainder a. Ignore the quotient.
    a = y % 19

    # Divide y by 100 to get a quotient b and a remainder c.
    b = y // 100
    c = y % 100

    # you could also do b, c = y // 100, y % 100

    # Divide b by 4 to get a quotient d and a remainder e.
    d = b // 4
    e = b % 4

    # Divide (8 * b + 13) by 25 to get a quotient g. Ignore the remainder.
    g = (8 * b + 13) // 25

    # Divide (19 * a + b - d - g + 15) by 30 to get a remainder h. Ignore the quotient.
    h = (19 * a + b - d - g + 15) % 30

    # Divide c by 4 to get a quotient j and a remainder k.
    j = c // 4
    k = c % 4

    # Divide (a + 11 * h) by 319 to get a quotient m. Ignore the remainder.
    m = (a + 11 * h) // 319

    # Divide (2 * e + 2 * j - k - h + m + 32) by 7 to get a remainder r.
    # Ignore the quotient.
    r = (2 * e + 2 * j - k - h + m + 32) % 7

    # Divide (h - m + r + 90) by 25 to get a quotient n. Ignore the remainder.
    n = (h - m + r + 90) // 25

    # Divide (h - m + r + n + 19) by 32 to get a remainder p. Ignore the quotient.
    p = (h - m + r + n + 19) % 32

    # Enter year: 2001
    # In 2001 Easter Sunday is on month 4 and day 15

    # Then Easter Sunday falls on day p of the month n.
    print("In", y, "Easter Sunday is on month", n, "and day", p)

main()

