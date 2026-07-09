###########################################################################
#                                                                         #
#                         Compute Ordinal Date                            #
#                                                                         #
###########################################################################

"""Given a date in the Gregorian calendar, compute the 'ordinal date,' i.e.
corresponding numerical day of the year.  Note that this computation needs
to take into account whether or not it's a leap year. """

# Give symbolic names to the numbers used to represent months.

JAN =  1
FEB =  2
MAR =  3
APR =  4
MAY =  5
JUN =  6
JUL =  7
AUG =  8
SEP =  9
OCT = 10
NOV = 11
DEC = 12

# How many days are in each month.  These are all just literal constants, 
# i.e., just names for some data that make your program more readable. 

JAN_DAYS = 31
# Skipping February for now.
MAR_DAYS = 31
APR_DAYS = 30
MAY_DAYS = 31
JUN_DAYS = 30
JUL_DAYS = 31
AUG_DAYS = 31
SEP_DAYS = 30
OCT_DAYS = 31
NOV_DAYS = 30
DEC_DAYS = 31

def computeOrdinalDate():
    """Compute the ordinal date for any date of any year in the Gregorian
    calendar (which began in 1753).  We tediously validate all of the
    inputs.  This would all be much easier and compact using
    constructs we'll introduce later in the semester: lists,
    functions, loops.  Assume that inputs from the user are all integers.

    """

    # Accept and validate the year. Coerce to an int, if legal.
    year  = int( input("Specify a year: ") )

    # Let's do some validation on the year. 
    if not (year > 1752):
        print("Bad year entered:", year)
        return

    # Accept and validate the month. Coerce to an int if legal.
    month = int( input("Specify a month (1-12): ") )

    # Validate the month:
    if not (JAN <= month <= DEC):
        print("Bad month entered:", month)
        return

    # Accept and validate the day. Coerce to an int if legal.
    day = int( input("Specify a day of the month (1-31): ") )

    # Validate the day:
    # This is horrible, but necessary if you can't use functions or lists:
    if not (# month is February and a leap year.
            ( (month == FEB) and (( year % 4 == 0 ) and ( not ( year % 100 == 0 ) or ( year % 400 == 0 ))) and (1 <= day <= 29) ) \
            # Month is February and it's not a leap year
            or ( (month == FEB) and (1 <= day <= 28) ) \
            # Month is April, June, September, or November
            or ( ( (month == APR) or (month == JUN) or (month == SEP) or (month == NOV) ) and (1 <= day <= 30) ) \
            # All other months
            or ( (    (month == JAN) or (month == MAR) or (month == MAY) or (month == JUL)  \
                      or (month == AUG) or (month == OCT) or (month == DEC) ) and (1 <= day <= 31 ) ) ):
        print("Bad day entered:", day)
        return

    # At this point, we know the date is legal.

    # Since we have the year, we can compute FEB_DAYS.
    FEB_DAYS = 29 if ( year % 4 == 0 ) and ( not ( year % 100 == 0 ) or ( year % 400 == 0 )) else 28
    
    if month == JAN:
        ordinalDate = day
    elif month == FEB:
        ordinalDate = JAN_DAYS + day
    elif month == MAR:
        ordinalDate = JAN_DAYS + FEB_DAYS + day
    elif month == APR:
        ordinalDate = JAN_DAYS + FEB_DAYS + MAR_DAYS + day
    elif month == MAY:
        ordinalDate = JAN_DAYS + FEB_DAYS + MAR_DAYS + APR_DAYS + day
    elif month == JUN:
        ordinalDate = JAN_DAYS + FEB_DAYS + MAR_DAYS + APR_DAYS + MAY_DAYS + day
    elif month == JUL:
        ordinalDate = JAN_DAYS + FEB_DAYS + MAR_DAYS + APR_DAYS + MAY_DAYS + JUN_DAYS + day
    elif month == AUG:
        ordinalDate = JAN_DAYS + FEB_DAYS + MAR_DAYS + APR_DAYS + MAY_DAYS + JUN_DAYS + JUL_DAYS + day
    elif month == SEP:
        ordinalDate = JAN_DAYS + FEB_DAYS + MAR_DAYS + APR_DAYS + MAY_DAYS + JUN_DAYS + JUL_DAYS + AUG_DAYS + day
    elif month == OCT:
        ordinalDate = JAN_DAYS + FEB_DAYS + MAR_DAYS + APR_DAYS + MAY_DAYS + JUN_DAYS + JUL_DAYS + AUG_DAYS + SEP_DAYS + day
    elif month == NOV:
        ordinalDate = JAN_DAYS + FEB_DAYS + MAR_DAYS + APR_DAYS + MAY_DAYS + JUN_DAYS + JUL_DAYS + AUG_DAYS + SEP_DAYS + OCT_DAYS + day
    elif month == DEC:
        ordinalDate = JAN_DAYS + FEB_DAYS + MAR_DAYS + APR_DAYS + MAY_DAYS + JUN_DAYS + JUL_DAYS + AUG_DAYS + SEP_DAYS + OCT_DAYS + NOV_DAYS + day
    
    # Print out the result:

    print(month, "/", day, "/", year, " is day ", ordinalDate, " of the year.", sep = "")

computeOrdinalDate()
