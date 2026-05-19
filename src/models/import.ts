import type { WatchModel } from "./watch";

export interface ImportModel{
     id:number;

     importDate:string;

     totalItems:number;

    supplier?: string | null;

}