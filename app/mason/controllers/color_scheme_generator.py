from typing import Literal
from pathlib import Path
from mason.models import ColorsModel
import json

class ColorSchemeCreator:
    def __init__(self):
        self.JSON_PATH = Path("/app/config/colors.json")
        self.OUTPUT_DARK = Path("/app/site/assets/dark.css")
        self.OUTPUT_LIGHT = Path("/app/site/assets/light.css")
    
    def make_file(self, dark_in: ColorsModel|None = None, light_in: ColorsModel|None = None):
        """
        Creates *dark.css* and *light.css* respectively from *dark* and *light* dicts passed in the parameters. <br/>
        <br/>
        If neither *dark*, *light* or both are specified, it'll try creating from */app/config/colors.json*, 
        or ultimately use the default values of *ColorsModel*.
        """
        dark: ColorsModel
        light: ColorsModel

        if not dark_in:
            try:
                with open(self.JSON_PATH, "r") as f:
                    colors = json.loads(f.read())
                    dark = ColorsModel(**colors["dark"])
            except:
                dark = ColorsModel.default_dark()
        else:
            dark = dark_in

        if not light_in:
            try:
                with open(self.JSON_PATH, "r") as f:
                    colors = json.loads(f.read())
                    light = ColorsModel(**colors["light"])
            except:
                light = ColorsModel.default_light()
        else:
            light = light_in

        dark = dark.model_dump()
        light = light.model_dump()

        lines = []
        lines.append(":root{\n")
        for k in dark.keys():
            class_name = k.replace("_", "-")
            lines.append(f'\t--{class_name}: #{dark[k]};\n')
            if k == "text":
                lines.append(f'\t--{class_name}-trans: {self._toTrans(dark[k], weight="0.8")};\n')
            else:
                lines.append(f'\t--{class_name}-trans: {self._toTrans(dark[k])};\n')
        lines.append("}")
        with open(self.OUTPUT_DARK, "w") as f:
            f.writelines(lines)

        lines = []
        lines.append(":root{\n")
        for k in light.keys():
            class_name = k.replace("_", "-")
            lines.append(f'\t--{class_name}: #{light[k]};\n')
            if k in ["text", "bg", "alternateBg"]:
                lines.append(f'\t--{class_name}-trans: {self._toTrans(light[k], weight="0.8")};\n')
            else:
                lines.append(f'\t--{class_name}-trans: {self._toTrans(light[k])};\n')
        lines.append("}")
        with open(self.OUTPUT_LIGHT, "w") as f:
            f.writelines(lines)

        with open(self.JSON_PATH, "w") as f:
            f.write(json.dumps({
                "dark": dark,
                "light": light
            }, indent=2))

    def get_colors(self):
        try:
            with open(self.JSON_PATH, "r") as f:
                return json.loads(f.read())
        except:
            return {
                "dark": ColorsModel.default_dark(),
                "light": ColorsModel.default_light()
            }

    def _toTrans(self, color: str, weight: Literal["0.1", "0.2", "0.4", "0.6", "0.8"] = "0.2"):
        r = int(f'{color[0]}{color[1]}', 16)
        g = int(f'{color[2]}{color[3]}', 16)
        b = int(f'{color[4]}{color[5]}', 16)
        return f'rgba({r}, {g}, {b}, {weight})'
    
