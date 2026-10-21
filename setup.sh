#!/bin/bash
# Copyright 2026 Google LLC
# Modified by the DialekKita team (UTM), 2026: Malaysian dialect support.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

cd "$(dirname "$0")"

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing requirements..."
pip install --require-hashes --extra-index-url https://pypi.org/simple/ -r backend/requirements.txt

echo "Installing DialekKita extras (Malay speech-to-text)..."
pip install -r backend/requirements-dialekkita.txt

if ! command -v espeak-ng &> /dev/null; then
    echo "[DialekKita] espeak-ng not found — needed for Malay/Tamil voice output."
    echo "[DialekKita] Install it with: sudo apt-get install espeak-ng   (macOS: brew install espeak-ng)"
fi

echo "========================================="
echo "Setup complete!"
echo "Run ./download_model.sh to download the model."
echo "Run ./start.sh to start the servers."
echo "========================================="
