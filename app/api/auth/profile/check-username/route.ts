import { checkUsernameAvailability } from '@/lib/auth/profile-service';
import {
  ApiResponseBuilder,
  ValidationHelper,
  withApiHandler,
} from '@/lib/utils/api-helpers';

interface CheckUsernameParams extends Record<string, unknown> {
  username: string;
}

export const GET = withApiHandler<CheckUsernameParams>(async (params) => {
  // 필수 필드 검증
  const { isValid, errors } = ValidationHelper.checkRequired(params, [
    'username',
  ]);
  if (!isValid) {
    return ApiResponseBuilder.validation('필수 필드가 누락되었습니다.', errors);
  }

  const { username } = params;

  // 길이 검증
  const lengthErrors = ValidationHelper.validateStringLength(
    username,
    '사용자명',
    3,
    20
  );
  if (lengthErrors.length > 0) {
    return ApiResponseBuilder.error(lengthErrors[0], 400);
  }

  // 패턴 검증
  const patternErrors = ValidationHelper.validatePattern(
    username,
    /^[a-zA-Z0-9_-]+$/,
    '사용자명',
    '영문, 숫자, _, - 만 사용 가능합니다.'
  );
  if (patternErrors.length > 0) {
    return ApiResponseBuilder.error(patternErrors[0], 400);
  }

  // 사용자명 중복 확인
  const result = await checkUsernameAvailability(username);

  if (!result.success) {
    return ApiResponseBuilder.error(result.error || '사용자명 확인 실패', 500);
  }

  return ApiResponseBuilder.success(
    result.data,
    result.data?.available
      ? '사용 가능한 사용자명입니다.'
      : '이미 사용 중인 사용자명입니다.'
  );
});
