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
    bread = bread or random.choice(BREADS)
    protein = protein or random.choice(PROTEINS)
    cheese = cheese or random.choice(CHEESES)
    veggies = veggies or random.sample(VEGGIES, k=random.randint(1, 3))
    condiments = condiments or random.sample(CONDIMENTS, k=random.randint(1, 2))

    sandwich = {
        "bread": bread,
        "protein": protein,
        "cheese": cheese,
        "veggies": veggies,
        "condiments": condiments,
    }
    return sandwich


LAYER_ART = {
    "bread_top": [
        r"            _....----''''----...._",
        r"        .-''    _.--''    ''--._   ''-.",
        r"      .'    .-'    .--.  .--    '-.   '.",
        r"     /   .-'    .-'   /  \   '-.   '-.  \\",
        r"    /  .'    .-' .--./    \.--. '-.   '. \\",
        r"   / .'   .-' .-'   /      \   '-. '-. '. \\",
        r"  /.'  .-'  .'  _.-'        '-._  '.  '-.'\\",
        r"  /.-'   .'  .-'                '-.  '.   '\\",
        r" /    .-'_.-'                      '-._'-.  \\",
        r" |--''--------.____          ____.--------''--|",
    ],
    "bread_bottom": [
        r" |_.--------.____  ''------''  ____.--------._|",
        r"  \''--..___     ''----------''     ___..--''/",
        r"   ''--..__  ''----.......----''  __..--''",
        r"           '''---...______...---'''",
    ],
    "protein": {
        "turkey":          r" |~~turkey~~~~turkey~~~~turkey~~~~turkey~~|",
        "ham":             r" |##ham######ham######ham######ham########|",
        "roast beef":      r" |==roast=beef===roast=beef===roast=beef==|",
        "grilled chicken": r" |//grilled//chicken//grilled//chicken////|",
        "bacon":           r" |~~~~~~/\/\/\/\~bacon~/\/\/\/\~~~~~~~~~~~|",
        "salami":          r" |@@salami@@@@salami@@@@salami@@@@salami@@|",
    },
    "cheese": {
        "cheddar":     r" |::cheddar::::::::::::::::::::cheddar::::|",
        "swiss":       r" |::swiss::():::():::():::():::swiss::::::|",
        "provolone":   r" |::provolone:::::::::::::::::provolone:::|",
        "pepper jack":  r" |::pepper*jack::*::*::*::*::pepper*jack::|",
        "brie":        r" |::brie~~~~~~~~~~~~~~~~~~~~~~~~~~brie::::|",
        "gouda":       r" |::gouda::::::::::::::::::::::::gouda::::|",
    },
    "veggie": {
        "lettuce":   r" |~{{{lettuce}}}~{{{lettuce}}}~{{{~}}}}~~|",
        "tomato":    r" |ooo(tomato)ooo(tomato)ooo(tomato)ooooooo|",
        "onion":     r" |)))onion(((onion)))onion(((onion)))onion(|",
        "pickles":   r" |==[pickles]==[pickles]==[pickles]===[]===|",
        "jalapeños": r" |~~<jalapeño>~~<jalapeño>~~<jalapeño>~~<>~|",
        "avocado":   r" |~~(avocado~~)(avocado~~)(avocado~~)(~~)~~|",
        "spinach":   r" |~{{spinach}}~~{{spinach}}~~{{spinach}}~~~|",
    },
    "condiment": {
        "mustard":   r" |....mustard.......mustard.......mustard..|",
        "mayo":      r" |,,,,mayo,,,,,,,,,mayo,,,,,,,,,,mayo,,,,,,|",
        "hot sauce":  r" |!!!!hot!sauce!!!!!hot!sauce!!!!hot!sauce!|",
        "pesto":     r" |....pesto.......pesto........pesto.......|",
        "olive oil":  r" |....olive.oil......olive.oil......oil....|",
        "ranch":     r" |,,,,ranch,,,,,,,,,ranch,,,,,,,ranch,,,,,,|",
    },
}


def display_sandwich(sandwich):
    """Print a sandwich as a layered ASCII art cross-section."""
    print()
    for line in LAYER_ART["bread_top"]:
        print(line)
    for condiment in sandwich["condiments"]:
        print(LAYER_ART["condiment"][condiment])
    print(LAYER_ART["cheese"][sandwich["cheese"]])
    print(LAYER_ART["protein"][sandwich["protein"]])
    for veggie in sandwich["veggies"]:
        print(LAYER_ART["veggie"][veggie])
    for line in LAYER_ART["bread_bottom"]:
        print(line)
    print()


if __name__ == "__main__":
    print("Making you a sandwich...")
    sandwich = make_sandwich()
    display_sandwich(sandwich)
    print("Enjoy!")
