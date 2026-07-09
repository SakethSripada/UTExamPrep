###################################################################################
#                                                                                 #
#                                  Calculate PI                                   #
#                                                                                 #
###################################################################################

# This is a previous assignment HW7.  The goal is to calculate pi by
# picking n random points within a unit circle inscribed in a square.
# The area of the circle is pi and the area of the square is 4.
# Hence, the ratio of points in the circle to total points chosen
# should approach pi/4 as n increases.  

import math
import random

def distance( x1, y1, x2, y2 ):
    """Find the distance from point (x1, y1) to (x2, y2)."""
    return math.sqrt( (x1 - x2)**2 + (y1 - y2)**2 )

class Circle:
    """Construct a circle object centered at (x, y) with radius rad.
       Default the center to (0, 0) with radius 1."""
    def __init__(self, rad = 1, x = 0, y = 0):
        self.__centerX = x
        self.__centerY = y
        self.__radius = rad
    
    def __str__(self):
        """Circle prints as: Circle of radius r centered at point (x, y)."""
        return "Circle of radius " + str(self.__radius) + " centered at point (" \
            + str(self.__centerX) + ", " + str(self.__centerY) + ")"

    def getRadius(self):
        """Return the radius."""
        return self.__radius

    def getCenterX(self):
        """Return the X coordinate of the center point."""
        return self.__centerX

    def getCenterY(self):
        """Return the Y coordinate of the center point."""
        return self.__centerY

    def pointInCircle(self, x, y):
        """Return a boolean indicating whether point (x, y) is inside the
        circle.  Note that a point on the perimeter is not considered
        within the circle."""
        return distance(self.__centerX, self.__centerY, x, y) < self.__radius

    def getArea(self):
        """Return the area of the circle."""
        return math.pi * ( self.__radius ** 2 )

class Square:
    """Construct a square with given side length, aligned with the axes
    and top left corner at point (x, y)."""
    def __init__(self, side = 1, x = 0, y = 0):
        self.__side = side
        self.__ULX = x
        self.__ULY = y
    
    def __str__(self):
        """Square prints as: Square of side l with upper left point at (x, y)."""
        return "Square of side " + str(self.__side) + " with upper left point at (" \
            + str(self.__ULX) + ", " + str(self.__ULY) + ")"

    def getSide(self):
        """Return the length of the side."""
        return self.__side

    def getULX(self):
        """Return the X coordinate of the upper left corner of the square."""
        return self.__ULX
    
    def getULY(self):
        """Return the Y coordinate of the upper left corner of the square."""
        return self.__ULY
    
    def pointInSquare(self, a, b):
        """Return a boolean indicating whether point (x, y) is inside the
        square.  Note that a point on the perimeter is not considered
        within the square."""
        x = self.__ULX
        y = self.__ULY
        return  ( x < a < (x + self.__side)) \
            and ( (y - self.__side) < b < y )
    
    def getArea(self):
        return self.__side ** 2

    
def estimatePi( c, n ):
    """Given a circle c of radius 1 and count n, generate an estimate of
       pi. Choose n random points within the square inscribing the
       circle. The ratio of points within the circle to n should be pi/4."""
    hits = 0
    misses = 0

    for i in range(n):
        x = random.random() * 2 - 1
        y = random.random() * 2 - 1
        if c.pointInCircle( x, y ):
            hits += 1
        else:
            misses += 1
    
    estimate = (hits / n) * 4
    return estimate

def main():
    # Create a Square object of side 2 with upper left point at (-1, 1).
    s = Square( 2, -1, 1 )
    # Create a Circle object or radius 1 centered at (0, 0).
    c = Circle( 1, 0, 0 )
    
    for n in range(2, 8):
        num = 10**n
        ans = estimatePi( c, num )
        diff = ans - math.pi
        print("num =", format(num, "<10d"), "Calculated PI =", format(ans, ".6f"), \
              "  Difference =", format(diff, "+0.6f"))

main()
                                                                 
