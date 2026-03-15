#!/usr/bin/env python3
"""A sandwich maker that builds delicious sandwiches."""

import random


BREADS = ["sourdough", "rye", "whole wheat", "ciabatta", "brioche", "pumpernickel"]
PROTEINS = ["turkey", "ham", "roast beef", "grilled chicken", "bacon", "salami"]
CHEESES = ["cheddar", "swiss", "provolone", "pepper jack", "brie", "gouda"]
VEGGIES = ["lettuce", "tomato", "onion", "pickles", "jalapeños", "avocado", "spinach"]
CONDIMENTS = ["mustard", "mayo", "hot sauce", "pesto", "olive oil", "ranch"]


def make_sandwich(bread=None, protein=None, cheese=None, veggies=None, condiments=None):
    """Build a sandwich with the given ingredients, or pick random ones."""
    bread = bread if bread is not None else random.choice(BREADS)
    protein = protein if protein is not None else random.choice(PROTEINS)
    cheese = cheese if cheese is not None else random.choice(CHEESES)
    veggies = veggies if veggies is not None else random.sample(VEGGIES, k=random.randint(1, 3))
    condiments = condiments if condiments is not None else random.sample(CONDIMENTS, k=random.randint(1, 2))

    sandwich = {
        "bread": bread,
        "protein": protein,
        "cheese": cheese,
        "veggies": veggies,
        "condiments": condiments,
    }
    return sandwich


def display_sandwich(sandwich):
    """Print a sandwich in a visually appealing way."""
    w = 36
    print()
    print("=" * w)
    print(f"  {'~' * (w - 4)}  ")
    print(f"  {sandwich['bread'].center(w - 4)}  ")
    print(f"  {'~' * (w - 4)}  ")
    for condiment in sandwich["condiments"]:
        print(f"  {condiment.center(w - 4)}  ")
    print(f"  {sandwich['cheese'].center(w - 4)}  ")
    print(f"  {sandwich['protein'].center(w - 4)}  ")
    for veggie in sandwich["veggies"]:
        print(f"  {veggie.center(w - 4)}  ")
    print(f"  {'~' * (w - 4)}  ")
    print(f"  {sandwich['bread'].center(w - 4)}  ")
    print(f"  {'~' * (w - 4)}  ")
    print("=" * w)
    print()


if __name__ == "__main__":
    print("Making you a sandwich...")
    sandwich = make_sandwich()
    display_sandwich(sandwich)
    print("Enjoy!")
