import admin from 'firebase-admin';

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  // 개발 환경에서 필수 설정 확인
  const isEmulatorMode = process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const hasCredentials = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (process.env.NODE_ENV === 'development' && !isEmulatorMode && !hasCredentials) {
    console.warn('Firebase Admin: No explicit credentials or emulators configured in development');
    console.warn('For optimal development experience, consider setting:');
    console.warn('1. Both FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST for emulator mode');
    console.warn('2. FIREBASE_SERVICE_ACCOUNT (service account JSON string)');
    console.warn('3. GOOGLE_APPLICATION_CREDENTIALS (path to service account file)');
    console.warn('Attempting to proceed with Application Default Credentials...');
  }

  try {
    const config: any = {};

    // 프로젝트 ID 설정 (에뮬레이터에서는 필수)
    if (isEmulatorMode) {
      if (!process.env.FIREBASE_PROJECT_ID) {
        throw new Error('FIREBASE_PROJECT_ID is required when using emulators');
      }
      config.projectId = process.env.FIREBASE_PROJECT_ID;
      console.log('Using Firebase emulators with project:', config.projectId);
    } else {
      config.projectId = process.env.FIREBASE_PROJECT_ID || 'match-point-0918';
    }

    // 서비스 계정 JSON이 환경 변수로 제공된 경우
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        config.credential = admin.credential.cert(serviceAccount);
        console.log('Using Firebase service account from environment variable');
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseError);
        throw parseError;
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Using Google Application Default Credentials');
    } else if (!isEmulatorMode) {
      console.log('No explicit credentials found, trying Application Default Credentials');
      config.credential = admin.credential.applicationDefault();
    }

    // 에뮬레이터 환경 로깅
    if (isEmulatorMode) {
      console.log('Using Firestore emulator at:', process.env.FIRESTORE_EMULATOR_HOST);
      console.log('Using Firebase Auth emulator at:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
    }

    admin.initializeApp(config);
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    console.error('');
    console.error('To fix this issue, set up Firebase credentials:');
    console.error('1. For service account: Set FIREBASE_SERVICE_ACCOUNT environment variable');
    console.error('2. For ADC: Set GOOGLE_APPLICATION_CREDENTIALS path or run "gcloud auth application-default login"');
    console.error('3. For emulator: Set FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST');
    
    // 개발 환경에서는 에뮬레이터 필요
    if (process.env.NODE_ENV === 'development') {
      console.error('Development mode requires Firebase emulators or valid credentials');
      console.error('Please set FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST');
      throw new Error('Firebase Admin initialization failed in development mode. Set up emulators or credentials.');
    } else {
      throw error;
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

// Firebase Auth 미들웨어
export async function verifyFirebaseToken(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = { uid: decodedToken.uid };
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
}

export default admin;