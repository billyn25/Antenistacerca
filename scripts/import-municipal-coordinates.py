"""Import IGN municipality map references from a downloaded official XLSX.

This maintenance command is not part of the site build and uses no network.
"""
from datetime import date
from hashlib import sha256
import json
from pathlib import Path
import sys
from urllib.parse import parse_qs, urlsplit
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parent.parent
SOURCE_URL = "https://www.ign.es/resources/ane/Informacion_Geografica_Destacada/IGN_INFOGEO_MUNICIPIOS.xlsx"
SOURCE_PAGE = "https://www.ign.es/resources/ane/Informacion_Geografica_Destacada/IGN_INFOGEO_MUNICIPIOS.html"
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
PROVINCES = {
    "alava": "01", "asturias": "33", "bizkaia": "48", "burgos": "09",
    "cantabria": "39", "gipuzkoa": "20", "guadalajara": "19",
    "la-rioja": "26", "leon": "24", "madrid": "28", "navarra": "31",
    "palencia": "34", "salamanca": "37", "segovia": "40", "soria": "42",
    "toledo": "45", "valladolid": "47", "zamora": "49",
}


def sheet_rows(archive, filename, strings):
    root = ET.fromstring(archive.read(filename))
    for row in root.find("s:sheetData", NS):
        values = {}
        for cell in row:
            value = cell.find("s:v", NS)
            text = value.text if value is not None else ""
            if cell.get("t") == "s":
                text = strings[int(text)]
            values["".join(c for c in cell.get("r") if c.isalpha())] = text
        yield values


def main(source):
    payload = source.read_bytes()
    with ZipFile(source) as archive:
        strings = ["".join(node.itertext()) for node in ET.fromstring(archive.read("xl/sharedStrings.xml"))]
        info = list(sheet_rows(archive, "xl/worksheets/sheet1.xml", strings))
        reviewed = next(row["B"] for row in info if row.get("A") == "Fecha de revisión")
        rows = list(sheet_rows(archive, "xl/worksheets/sheet2.xml", strings))
    if rows[0].get("A") != "Identificador" or rows[0].get("G") != "Ver en mapa":
        raise ValueError("The official workbook columns changed; inspect it before importing.")
    by_ine = {}
    for row in rows[1:]:
        if not row.get("A"):
            continue
        code = str(row["A"]).zfill(5)
        if code in by_ine:
            raise ValueError("Duplicate INE code: " + code)
        longitude, latitude = map(float, parse_qs(urlsplit(row["G"]).query)["center"][0].split(","))
        if not (-19 <= longitude <= 5 and 27 <= latitude <= 44.5):
            raise ValueError("Invalid Spanish municipality coordinate: " + code)
        by_ine[code] = {"ine": code, "officialName": row["B"], "latitude": latitude, "longitude": longitude}
    # Match the reviewed route -> INE correspondence, not ambiguous spellings.
    assignments = json.loads((ROOT / "content/tdt-areas.json").read_text())["municipalities"]
    municipalities = {}
    for route, assignment in sorted(assignments.items()):
        code = assignment["ine"]
        if code[:2] != PROVINCES[route.split("/", 1)[0]]:
            raise ValueError("INE province does not match the route: " + route)
        municipalities[route] = by_ine[code]
    data = {
        "source": {
            "publisher": "Instituto Geográfico Nacional (IGN)",
            "dataset": "Información geográfica destacada: municipios (NGMEP)",
            "page": SOURCE_PAGE,
            "download": SOURCE_URL,
            "workbookReviewDate": reviewed,
            "retrievedOn": date.today().isoformat(),
            "sha256": sha256(payload).hexdigest(),
            "sourceMunicipalities": len(by_ine),
            "coordinateMeaning": "Punto de referencia municipal publicado por IGN en la columna Ver en mapa; localización aproximada, no distancia por carretera.",
            "coordinateReference": "Longitud y latitud del enlace al visor oficial; ETRS89 en los municipios peninsulares de este proyecto.",
            "routeMapping": "Correspondencia por código INE de content/tdt-areas.json; los nombres del sitio y sus URLs se conservan.",
        },
        "municipalities": municipalities,
    }
    target = ROOT / "content/municipal-coordinates.json"
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"Referencias IGN importadas: {len(municipalities)} municipios; {target.relative_to(ROOT)}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/import-municipal-coordinates.py /path/to/IGN_INFOGEO_MUNICIPIOS.xlsx")
    main(Path(sys.argv[1]))
