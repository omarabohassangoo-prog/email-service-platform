declare module 'typeorm' {
  export function Entity(name?: string, options?: any): ClassDecorator;
  export function Index(name?: string | string[], fields?: string[], options?: any): ClassDecorator & PropertyDecorator;
  export function PrimaryGeneratedColumn(strategy?: string, options?: any): PropertyDecorator;
  export function Column(options?: any): PropertyDecorator;
  export function CreateDateColumn(options?: any): PropertyDecorator;
  export function UpdateDateColumn(options?: any): PropertyDecorator;
  export function OneToMany(typeFunction: (type?: any) => any, inverseSide: (object: any) => any, options?: any): PropertyDecorator;
  export function ManyToOne(typeFunction: (type?: any) => any, inverseSide?: (object: any) => any, options?: any): PropertyDecorator;
  export function JoinColumn(options?: any): PropertyDecorator;
  export class DataSource {
    constructor(options: any);
    initialize(): Promise<this>;
    destroy(): Promise<void>;
  }
}
