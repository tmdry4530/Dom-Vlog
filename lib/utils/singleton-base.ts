/**
 * 싱글톤 패턴 베이스 클래스
 * 여러 서비스 클래스에서 반복되는 싱글톤 구현을 통합
 */

export abstract class SingletonBase<_T = any> {
  protected static instances = new Map<string, unknown>();

  /**
   * 싱글톤 인스턴스를 가져옵니다
   */
  protected static getInstance<T extends SingletonBase<T>>(
    this: new () => T,
    className?: string
  ): T {
    const key = className || this.name;

    if (!SingletonBase.instances.has(key)) {
      SingletonBase.instances.set(key, new this());
    }

    return SingletonBase.instances.get(key) as T;
  }

  /**
   * 싱글톤 인스턴스를 재설정합니다 (테스트용)
   */
  protected static resetInstance(className?: string): void {
    const key = className || this.name;
    SingletonBase.instances.delete(key);
  }

  /**
   * 모든 싱글톤 인스턴스를 초기화합니다 (테스트용)
   */
  protected static resetAllInstances(): void {
    SingletonBase.instances.clear();
  }
}

/**
 * 인스턴스 생명주기 관리를 위한 인터페이스
 */
export interface Initializable {
  initialize(): Promise<void> | void;
  destroy(): Promise<void> | void;
}

/**
 * 설정 가능한 싱글톤 베이스 클래스
 */
export abstract class ConfigurableSingleton<
    T,
    TConfig = Record<string, unknown>,
  >
  extends SingletonBase<T>
  implements Initializable
{
  protected config: TConfig;
  protected isInitialized = false;

  constructor(config?: TConfig) {
    super();
    this.config = config || ({} as TConfig);
  }

  /**
   * 설정과 함께 인스턴스를 가져옵니다
   */
  protected static getConfiguredInstance<
    T extends ConfigurableSingleton<T, TConfig>,
    TConfig,
  >(
    this: new (config?: TConfig) => T,
    config?: TConfig,
    className?: string
  ): T {
    const key = className || this.name;

    if (!SingletonBase.instances.has(key)) {
      const instance = new this(config);
      SingletonBase.instances.set(key, instance);
    }

    return SingletonBase.instances.get(key) as T;
  }

  /**
   * 초기화 상태를 확인하고 필요시 초기화를 수행합니다
   */
  protected async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
      this.isInitialized = true;
    }
  }

  /**
   * 설정을 업데이트합니다
   */
  public updateConfig(newConfig: Partial<TConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 현재 설정을 가져옵니다
   */
  public getConfig(): Readonly<TConfig> {
    return { ...this.config };
  }

  // 서브클래스에서 구현해야 하는 메서드들
  abstract initialize(): Promise<void> | void;
  abstract destroy(): Promise<void> | void;
}

/**
 * 리소스 관리가 가능한 싱글톤 베이스 클래스
 */
export abstract class ManagedSingleton<T> extends ConfigurableSingleton<T> {
  private resourceCleanupCallbacks: (() => Promise<void> | void)[] = [];

  /**
   * 리소스 정리 콜백을 등록합니다
   */
  protected registerCleanup(callback: () => Promise<void> | void): void {
    this.resourceCleanupCallbacks.push(callback);
  }

  /**
   * 모든 리소스를 정리합니다
   */
  public async destroy(): Promise<void> {
    // 역순으로 정리 (LIFO)
    for (const cleanup of this.resourceCleanupCallbacks.reverse()) {
      try {
        await cleanup();
      } catch (error) {
        console.error('Resource cleanup failed:', error);
      }
    }

    this.resourceCleanupCallbacks = [];
    this.isInitialized = false;
  }

  /**
   * 헬스 체크를 수행합니다
   */
  public async healthCheck(): Promise<{
    isHealthy: boolean;
    details: Record<string, unknown>;
  }> {
    return {
      isHealthy: this.isInitialized,
      details: {
        initialized: this.isInitialized,
        resourceCount: this.resourceCleanupCallbacks.length,
      },
    };
  }
}

/**
 * 싱글톤 팩토리 헬퍼
 */
export class SingletonFactory extends SingletonBase<SingletonFactory> {
  /**
   * 키 기반으로 싱글톤 인스턴스를 생성/관리합니다
   */
  static createKeyed<T>(key: string, factory: () => T): T {
    if (!SingletonBase.instances.has(key)) {
      SingletonBase.instances.set(key, factory());
    }

    return SingletonBase.instances.get(key) as T;
  }

  /**
   * 모든 등록된 싱글톤의 상태를 가져옵니다
   */
  static getInstanceStatus(): Record<
    string,
    {
      exists: boolean;
      type: string;
    }
  > {
    const status: Record<string, { exists: boolean; type: string }> = {};

    for (const [key, instance] of SingletonBase.instances.entries()) {
      status[key] = {
        exists: true,
        type: instance?.constructor.name || 'unknown',
      };
    }

    return status;
  }
}
