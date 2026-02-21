"""Pytest configuration for Aegis tests."""
import sys
from pathlib import Path

# Add project root to path so 'apps' can be imported
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
