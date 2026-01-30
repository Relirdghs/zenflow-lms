export function roleLabel(role?: string | null) {
  switch (role) {
    case "super_admin":
      return "Супер-админ";
    case "admin":
      return "Администратор";
    case "client":
      return "Клиент";
    default:
      return role ?? "";
  }
}
