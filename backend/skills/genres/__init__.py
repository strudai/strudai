"""Auto-discover genre skills from this package."""

import importlib
import pkgutil

from backend.skills.base import Skill

_genre_skills: dict[str, Skill] = {}

for _, module_name, _ in pkgutil.iter_modules(__path__):
    mod = importlib.import_module(f"{__name__}.{module_name}")
    for attr_name in dir(mod):
        obj = getattr(mod, attr_name)
        if isinstance(obj, Skill) and obj.name.startswith("genre:"):
            _genre_skills[obj.name] = obj


def get_genre(name: str) -> Skill | None:
    """Get a genre skill by name. Accepts 'techno' or 'genre:techno'."""
    key = name if name.startswith("genre:") else f"genre:{name}"
    return _genre_skills.get(key)


def all_genres() -> dict[str, Skill]:
    """Return all discovered genre skills."""
    return dict(_genre_skills)
