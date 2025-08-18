/**
 * **\<💥 Error\>**
 * ***InvalidInputValueError***
 * 올바르지 않은 값이 입력되었을때 발생하는 에러
 */
export class InvalidInputValueError extends Error {
  errorCode = "I001";
  statusCode = 400;

  constructor(reason, data) {
    super(reason);
    this.reason = reason;
    this.data = data;
  }
}
/**
 * **\<💥 Error\>**
 * ***InvalidTokenError***
 * 유효하지 않은 토큰으로 인한 요청이 발생했을때 발생하는 에러
 */
export class InvalidTokenError extends Error {
  errorCode = "I003";
  statusCode = 401;

  constructor(reason, data) {
    super(reason);
    this.reason = reason;
    this.data = data;
  }
}
