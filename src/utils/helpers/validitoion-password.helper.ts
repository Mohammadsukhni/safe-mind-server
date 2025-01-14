export class ValidationPassword {
  static uppercase = {
    rgx: /[A-Z]/,
    message: 'Password must contain at least one uppercase letter.',
  };

  static lowercase = {
    rgx: /[a-z]/,
    message: 'Password must contain at least one lowercase letter.',
  };

  static number = {
    rgx: /[0-9]/,
    message: 'Password must contain at least one number.',
  };

  static specialSymbol = {
    rgx: /[!@#$%^&*(),.?":{}|<>]/,
    message: 'Password must contain at least one special character.',
  };
}
