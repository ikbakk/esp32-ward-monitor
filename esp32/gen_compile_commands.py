import os
from typing import Any, cast

Import = cast(Any, globals()["Import"])
Import("env") # platformio specific stuff
env = cast(Any, globals()["env"])

# include toolchain paths (i.e. to have stuff like the Arduino framework headers present in the compile commands)
env.Replace(COMPILATIONDB_INCLUDE_TOOLCHAIN=True)

# override compilation DB path
env.Replace(COMPILATIONDB_PATH="compile_commands.json")
