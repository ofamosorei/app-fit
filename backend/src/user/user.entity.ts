import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  hasPaid: boolean;

  @Column({ unique: true, nullable: true })
  kiwifyOrderId: string;

  // Biometria
  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ nullable: true })
  sex: string; // 'male' | 'female'

  @Column({ nullable: true })
  activityLevel: string; // 'sedentary' | 'light' | 'moderate' | 'intense'

  // Anamnese Clínica
  @Column({ nullable: true })
  goal: string; // 'fast' | 'moderate' | 'maintenance'

  @Column({ type: 'float', nullable: true })
  targetWeight: number;

  @Column({ type: 'text', nullable: true })
  comorbidities: string;

  @Column({ type: 'text', nullable: true })
  medications: string;

  // Preferências
  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  dislikedFoods: string;

  @Column({ nullable: true })
  mealsPerDay: string; // '3' | '5'

  // Plano Nutricional Guardado
  @Column({ type: 'jsonb', nullable: true })
  plan: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
