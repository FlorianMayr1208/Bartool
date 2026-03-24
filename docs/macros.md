# Ingredient Macro Classification

Flavor macros are assigned through keyword matching using:

- `backend/app/services/macros.py`
- `backend/app/services/macros.yaml`

## Example

```python
from backend.app.services import macros

macros.macros_for_ingredient("fresh lime juice")
# ['sour']
```

## API usage

- `GET /macros` returns available macro names.
- Recipe suggestion endpoints accept:
  - `macros`: list of macro tags
  - `macro_mode`: `and`, `or`, or `not`
