import { IConnection } from "../common/Exports";
import { ConnectionFactoryBase } from "./ConnectionFactoryBase";
import { AuthInfo, RecognizerConfig } from "./Exports";
export declare class TranslationConnectionFactory extends ConnectionFactoryBase {
    create: (config: RecognizerConfig, authInfo: AuthInfo, connectionId?: string) => IConnection;
}