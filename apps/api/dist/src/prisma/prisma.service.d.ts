import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { User, Facility, Task } from '@wms/shared';
export interface DatabaseStore {
    facilities: Map<string, Facility>;
    users: Map<string, User & {
        passwordHash: string;
    }>;
    tasks: Map<string, Task>;
}
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    store: DatabaseStore;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    seedInitialData(): Promise<void>;
}
