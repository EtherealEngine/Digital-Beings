import os


class Colors:
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    RESET = '\033[0m'


def center(text):
    try:
        return text.center(os.get_terminal_size().columns)
    except:
        return text


def cprint(text, color=Colors.RESET, **kwargs):
    print(color + text + Colors.RESET, **kwargs)


def cinput(text, color=Colors.RESET, **kwargs):
    return input(color + text + Colors.RESET, **kwargs)


def draw_openchat():
    logos = [
        """                                                                                                     """,
        """                                                                                                     """,
        """                                                                                                     """,
        """     ____    ___    ____   ___   _____      _      _         ____    _____   ___   _   _    ____     """,
        """    |  _ \  |_ _|  / ___| |_ _| |_   _|    / \    | |       | __ )  | ____| |_ _| | \ | |  / ___|    """,
        """    | | | |  | |  | |  _   | |    | |     / _ \   | |       |  _ \  |  _|    | |  |  \| | | |  _     """,
        """    | |_| |  | |  | |_| |  | |    | |    / ___ \  | |___    | |_) | | |___   | |  | |\  | | |_| |    """,
        """    |____/  |___|  \____| |___|   |_|   /_/   \_\ |_____|   |____/  |_____| |___| |_| \_|  \____|    """,
        """                                                                                                     """,
        """                                                                                                     """,
        """                                         ... LOADING ...                                             """,
        """                                                                                                     """,
        """                                                                                                     """,
        """                                                                                                     """,
    ]

    for line in logos:
        cprint(
            text=center(line),
            color=Colors.CYAN,
        )
