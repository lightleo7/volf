import { VideoItem } from "@/types";

export abstract class BaseVideoParser {
    /** Имя площадки для отображения в интерфейсе (например, "Rutube") */
    abstract get sourceName(): string;

    /** Уникальное идентификатор площадки, для конфига (например, "rutube") */
    abstract get sourceIdentifier(): string;

    /** 
        * Асинхронный метод поиска
        * @param query - поисковый запрос пользователя
        * @returns Массив типизированных объектов VideoItem
    */
    abstract search(query: string): Promise<VideoItem[]>;
}
