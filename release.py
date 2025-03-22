#!/usr/bin/env python3
import os
import json
import hashlib
import shutil
from pathlib import Path
import argparse
from datetime import datetime

def calculate_sha256(filename):
    # Read file in chunks and calculate SHA256
    with open(filename, "rb") as f:
        return hashlib.file_digest(f, "sha256").hexdigest()

def create_plugin_package(version):
    # Update version in info.json first
    base_dir = Path(__file__).parent
    info_json_path = base_dir / "src" / "info.json"
    
    if not info_json_path.exists():
        raise FileNotFoundError(f"Could not find info.json at {info_json_path}")

    with open(info_json_path, 'r', encoding='utf-8') as f:
        info = json.load(f)
    
    info['version'] = version
    
    with open(info_json_path, 'w', encoding='utf-8') as f:
        json.dump(info, f, indent=2, ensure_ascii=False)

    # Create zip file from src directory
    src_dir = base_dir / "src"
    output_name = f"bob-plugin-siliconflow-tts-{version}"
    
    # Create zip archive
    shutil.make_archive(output_name, 'zip', src_dir)
    
    # Rename to .bobplugin
    plugin_file = f"{output_name}.bobplugin"
    os.rename(f"{output_name}.zip", plugin_file)
    
    return plugin_file

def update_appcast(version, plugin_file):
    base_dir = Path(__file__).parent
    appcast_file = base_dir / "appcast.json"
    
    # Calculate SHA256
    sha256 = calculate_sha256(plugin_file)
    
    # Read existing appcast.json
    if os.path.exists(appcast_file):
        with open(appcast_file, 'r') as f:
            appcast = json.load(f)
    else:
        appcast = {
            "identifier": "com.whymeta.bob-plugin-siliconflow-tts",
            "versions": []
        }
    
    # Create new version entry
    new_version = {
        "version": version,
        "desc": "auto",
        "sha256": sha256,
        "url": f"https://raw.githubusercontent.com/whymeta/bob-plugin-siliconflow-tts/releases/download/v{version}/{plugin_file}",
        "minBobVersion": "0.5.0"
    }
    
    # Add or update version
    versions = appcast["versions"]
    for i, v in enumerate(versions):
        if v["version"] == version:
            versions[i] = new_version
            break
    else:
        versions.insert(0, new_version)
    
    # Write updated appcast.json
    with open(appcast_file, 'w') as f:
        json.dump(appcast, f, indent=2)

def main():
    parser = argparse.ArgumentParser(description='Create Bob plugin package and update appcast.json')
    parser.add_argument('version', help='Version number (e.g., 0.0.1)')
    args = parser.parse_args()
    
    plugin_file = create_plugin_package(args.version)
    update_appcast(args.version, plugin_file)
    print(f"Created plugin package: {plugin_file}")
    print("Updated appcast.json")

if __name__ == "__main__":
    main() 