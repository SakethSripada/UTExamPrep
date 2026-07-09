
# These are the programming problems from Exam2 in the Spring 2025
# semester.  We'll go over these in class on Friday 10/25. The ones on
# your exam may be harder or easier than these.

#----------------------------------------------------------------------

# (10 points) On the next page, complete the function 
# 
#     mostExpensiveWithinBudget( budget, n )
# 
# You can assume that the parameters are a float budget indicating
# an amount of money you have to spend and a positive integer n
# indicating the number of items available.  You don't have to validate
# them.  Your program should loop to read n prices (using input
# statements with a prompt).  You will return the index (starting at 1)
# of the most expensive item that is within budget (less than or equal
# to budget).  Return -1 if none of the items are within
# budget. Assume all prices are non-negative and unique.  See the sample
# behaviors below:
# 
# >>> mostExpensiveWithinBudget( 10.50, 5 )
# Item price: 2.45
# Item price: 11.30
# Item price: 9.00
# Item price: 7.25
# Item price: 12.00
# 3
# >>> mostExpensiveWithinBudget( 2.00, 3 )
# Item price: 2.35
# Item price: 18.00
# Item price: 7.66
# -1
# >>> 

#----------------------------------------------------------------------


# (10 points) On the next page, complete the
# function simulateFairDiceRolls().  This accepts two values
# from the user: (1) an integer n representing the number of rolls
# of a fair 6-sided dice and (2) a possible result r of a roll (1,
# 2, 3, 4, 5 or 6).  It should print out the results of the n
# rolls on a single line separated by spaces and return the number of
# times r was rolled. You can assume that the user inputs a
# non-negative integer for n and that r is a possible
# roll. (Hint: the function \texttt{random.randint(i, j) returns a
# random integer between i and j, inclusive.)
# 
# Two sample calls to the function might look like this:
# 
# >>> n1 = simulateFairDiceRolls()
# Number of rolls: 12
# Looking for: 5
# 4 5 4 1 3 5 2 6 3 2 5 1 
# >>> n2 = simulateFairDiceRolls()
# Number of rolls: 20
# Looking for: 1
# 1 2 3 3 1 4 1 4 3 5 5 2 4 5 1 6 1 6 1 1 
# >>> 
# 
# After these calls, n1 will contain 3 since 5 was rolled three
# times during the first call, and n2 will contain 7 since 1 was
# rolled seven times during the second call.  Be sure to go to a new
# line at the end of printing the rolls; it's OK if there's a blank line
# (e.g. in the case where n == 0 and there weren't any rolls).

#----------------------------------------------------------------------

# (10 points) On the next page, complete the function countEvensOdds( n )
# Assume the parameter n is a positive integer and module random} has been 
# imported. Generate randomly n integers, each
# between 1 and 100, inclusive.  Count the number of even and the number
# of odd results.  Print out the counts as shown below and the ratio of
# evens to odds (i.e., evens / odds), with three digits after the decimal
# point.  Here are some sample runs:
# 
# >>> countEvensOdds( 10 )
# Evens: 6 Odds: 4 Ratio: 1.500
# >>> countEvensOdds( 1000 )
# Evens: 517 Odds: 483 Ratio: 1.070
# >>> countEvensOdds( 1000000 )
# Evens: 499556 Odds: 500444 Ratio: 0.998
# >>> 

