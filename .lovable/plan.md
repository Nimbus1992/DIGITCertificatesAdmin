## Fix receipt template dropdown placeholder

In `PaymentsConfigurator.tsx`, the receipt template `SelectValue` currently shows `"Select template"`. Update the `placeholder` prop to read:

```
Select from available documents
```

This is a one-line change inside the Generate Receipt section of the payment stage sheet.