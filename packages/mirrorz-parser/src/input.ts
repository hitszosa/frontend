import type {
  BooleanInput,
  InputCommon,
  InputType,
  Menu,
  MenuValue,
  ZDocConfig,
  ZDocInput,
  ZDocInputOptionSelect,
  ZDocInputText,
} from './types'

export function transpileInput(name: string, input: ZDocInput): InputType {
  const common: InputCommon = {
    title: input._,
    note: input.note,
  }

  if ('option' in input) {
    const items: Menu['items'] = []
    const transpileOption = ([optionName, optionSettings]: [
      string,
      ZDocInputOptionSelect,
    ]) => {
      const title = optionSettings?._ || optionName
      const values: MenuValue = { [name]: optionName }

      for (const [key, value] of Object.entries(optionSettings || {})) {
        if (key !== '_' && value !== undefined) {
          values[key] = value
        }
      }

      items.push([title, values])
    }

    const defaultOption = input.default
      ? input.option[input.default]
      : undefined
    if (input.default && defaultOption) {
      transpileOption([input.default, defaultOption])
    }

    for (const [optionName, optionSettings] of Object.entries(input.option)) {
      if (optionName !== input.default) {
        transpileOption([optionName, optionSettings])
      }
    }

    return { ...common, items }
  }

  if ('true' in input || 'false' in input) {
    const result: BooleanInput = {
      ...common,
      name,
      defaultValue: input.default ?? false,
      trueValue: input.true ?? true,
      falseValue: input.false ?? false,
    }
    return result
  }

  return {
    ...common,
    name,
    defaultValue: (input as ZDocInputText).default,
  }
}

export function transpileInputs(
  names: string | null | undefined,
  inputSettings: ZDocConfig['input'],
): InputType[] | string {
  if (!names) {
    return []
  }

  const inputNames = names.split(' ')
  const missingInput = inputNames.find(
    (inputName) => inputSettings[inputName] === undefined,
  )

  if (missingInput !== undefined) {
    return missingInput
  }

  return inputNames.map((inputName) =>
    transpileInput(inputName, inputSettings[inputName]!),
  )
}

export function createInitialState(menus: InputType[]): MenuValue {
  return menus.reduce<MenuValue>((values, menu) => {
    const initial =
      'items' in menu
        ? menu.items[0]?.[1] || {}
        : 'trueValue' in menu
          ? {
              [menu.name]: menu.defaultValue ? menu.trueValue : menu.falseValue,
            }
          : { [menu.name]: menu.defaultValue || '' }

    return { ...values, ...initial }
  }, {})
}
