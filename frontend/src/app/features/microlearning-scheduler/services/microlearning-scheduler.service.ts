import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Topic {
    id: string;
    name: string;
    unit?: string;
    estimatedHours: number;
    completed: boolean;
    completionDate?: Date;
}

export interface DailyPlan {
    date: Date;
    topics: Topic[];
    isRevision: boolean;
    totalHours: number;
}

export interface SchedulerData {
    examDate: Date;
    dailyStudyHours: number;
    syllabus: Topic[];
    startDate: Date;
}

@Injectable({
    providedIn: 'root'
})
export class MicrolearningSchedulerService {
    private scheduleSubject = new BehaviorSubject<DailyPlan[]>([]);
    public schedule$: Observable<DailyPlan[]> = this.scheduleSubject.asObservable();

    private isProcessingSubject = new BehaviorSubject<boolean>(false);
    public isProcessing$: Observable<boolean> = this.isProcessingSubject.asObservable();

    constructor() { }

    /**
     * Uploads syllabus PDF and parameters to the backend for processing.
     * Currently uses a placeholder for the backend API call.
     */
    uploadSyllabus(file: File, examDate: Date, dailyStudyHours: number): Observable<DailyPlan[]> {
        this.isProcessingSubject.next(true);

        // Mocking Backend processing delay
        return new Observable<DailyPlan[]>(observer => {
            setTimeout(() => {
                // In a real scenario, this would be:
                // const formData = new FormData();
                // formData.append('syllabus', file);
                // formData.append('examDate', examDate.toISOString());
                // formData.append('dailyStudyHours', dailyStudyHours.toString());
                // this.http.post<DailyPlan[]>('/api/scheduler/generate', formData)...

                // For now, we simulate backend returning a generated schedule
                const mockSyllabus: Topic[] = [
                    { id: '1', name: 'Introduction to Topic A', estimatedHours: 2, completed: false },
                    { id: '2', name: 'Advanced Concepts of Topic A', estimatedHours: 3, completed: false },
                    { id: '3', name: 'Practical Applications', estimatedHours: 4, completed: false },
                    { id: '4', name: 'Review and Case Studies', estimatedHours: 2, completed: false }
                ];

                const data: SchedulerData = {
                    examDate,
                    dailyStudyHours,
                    syllabus: mockSyllabus,
                    startDate: new Date()
                };

                const schedule = this.generateLocalSchedule(data); // Reusing logic as a fallback/simulation
                this.scheduleSubject.next(schedule);
                this.isProcessingSubject.next(false);
                observer.next(schedule);
                observer.complete();
            }, 2000); // 2 second processing time as per requirements
        });
    }

    // Internal helper to simulate backend's schedule distribution logic
    private generateLocalSchedule(data: SchedulerData): DailyPlan[] {
        const { examDate, dailyStudyHours, syllabus, startDate } = data;
        const remainingDaysCount = this.calculateRemainingDays(startDate, examDate);

        // Reserve last 2 days for revision
        const teachingDaysCount = Math.max(1, remainingDaysCount - 2);
        const revisionDaysCount = remainingDaysCount - teachingDaysCount;

        const schedule: DailyPlan[] = [];
        let currentTopicIndex = 0;
        const uncompletedTopics = syllabus.filter(t => !t.completed);

        for (let i = 0; i < teachingDaysCount; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dailyPlan: DailyPlan = {
                date: currentDate,
                topics: [],
                isRevision: false,
                totalHours: 0
            };

            while (currentTopicIndex < uncompletedTopics.length) {
                const topic = uncompletedTopics[currentTopicIndex];
                if (dailyPlan.totalHours + topic.estimatedHours <= dailyStudyHours || dailyPlan.topics.length === 0) {
                    dailyPlan.topics.push(topic);
                    dailyPlan.totalHours += topic.estimatedHours;
                    currentTopicIndex++;
                } else {
                    break;
                }
            }
            schedule.push(dailyPlan);
        }

        // Add revision days
        for (let i = 0; i < revisionDaysCount; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + teachingDaysCount + i);
            schedule.push({
                date: currentDate,
                topics: [],
                isRevision: true,
                totalHours: 0
            });
        }

        return schedule;
    }

    private calculateRemainingDays(start: Date, end: Date): number {
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    }

    toggleTopicCompletion(topicId: string): void {
        const currentSchedule = this.scheduleSubject.value;
        currentSchedule.forEach(day => {
            day.topics.forEach(topic => {
                if (topic.id === topicId) {
                    topic.completed = !topic.completed;
                }
            });
        });
        this.scheduleSubject.next([...currentSchedule]);
    }

    getTodayPlan(): DailyPlan | undefined {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.scheduleSubject.value.find(day => {
            const dayDate = new Date(day.date);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate.getTime() === today.getTime();
        });
    }
}
