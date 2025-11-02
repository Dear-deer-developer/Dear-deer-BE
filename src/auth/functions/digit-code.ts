export function create6DigitCode(): string {
  // Math.random()을 사용하여 100000부터 999999 사이의 숫자를 생성
  return String(Math.floor(100000 + Math.random() * 900000));
}
