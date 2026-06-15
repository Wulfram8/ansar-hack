/**
 * Русский словарь для refine i18nProvider.
 * Покрывает стандартные ключи refine (кнопки, страницы, уведомления)
 * и доменные подписи приложения.
 */
export const ru = {
  buttons: {
    create: "Создать",
    save: "Сохранить",
    logout: "Выйти",
    delete: "Удалить",
    edit: "Редактировать",
    cancel: "Отмена",
    confirm: "Вы уверены?",
    filter: "Фильтр",
    clear: "Очистить",
    refresh: "Обновить",
    show: "Просмотр",
    list: "Список",
    undo: "Отменить",
    import: "Импорт",
    export: "Экспорт",
    notAccessTitle: "Недостаточно прав",
  },
  warnWhenUnsavedChanges: "Есть несохранённые изменения. Покинуть страницу?",
  notifications: {
    success: "Успешно",
    error: "Ошибка (код: {{statusCode}})",
    undoable: "У вас есть {{seconds}} секунд на отмену",
    createSuccess: "Запись успешно создана",
    createError: "Ошибка при создании (код: {{statusCode}})",
    deleteSuccess: "Запись успешно удалена",
    deleteError: "Ошибка при удалении (код: {{statusCode}})",
    editSuccess: "Запись успешно обновлена",
    editError: "Ошибка при обновлении (код: {{statusCode}})",
    importProgress: "Импорт: {{processed}}/{{total}}",
  },
  loading: "Загрузка",
  tags: { clone: "Клонировать" },
  table: {
    actions: "Действия",
  },
  pages: {
    error: {
      info: "Возможно, вы забыли добавить компонент {{action}} для ресурса {{resource}}",
      404: "Страница не найдена",
      resource404: "Похоже, ресурс не существует",
      backHome: "На главную",
    },
    login: {
      title: "Вход в систему",
      signin: "Войти",
      username: "Логин",
      password: "Пароль",
      remember: "Запомнить меня",
    },
  },
  documentTitle: {
    default: "Hospital CRM",
  },
};

export type RuDictionary = typeof ru;
