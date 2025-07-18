# Ingredient Macro Classification

This component assigns broad flavour macros to ingredients based on simple
keyword matching. The available macros and their keywords live in
`backend/app/services/macros.yaml`.

## Usage

Import `macros` from `backend.app.services` and call
`macros_for_ingredient()` or `classify_recipe()`:

```python
from backend.app.services import macros

macros.macros_for_ingredient("fresh lime juice")
# ['sour']
```

The YAML file can be extended to refine the classification.

## API

``GET /macros`` returns the list of available macro names. The suggestions
endpoints accept ``macros`` and ``macro_mode`` query parameters to filter
recipes by those flavour tags.
