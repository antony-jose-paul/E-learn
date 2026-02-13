import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MicrolearningSchedulerService, DailyPlan, Topic, SchedulerData } from '../services/microlearning-scheduler.service';

@Component({
    selector: 'app-scheduler',
    templateUrl: './scheduler.component.html',
    styleUrls: ['./scheduler.component.css']
})
export class SchedulerComponent implements OnInit {
    schedulerForm: FormGroup;
    schedule: DailyPlan[] = [];
    isGenerated = false;
    isProcessing$ = this.schedulerService.isProcessing$;
    selectedFile: File | null = null;
    fileError: string | null = null;

    constructor(
        private fb: FormBuilder,
        private schedulerService: MicrolearningSchedulerService
    ) {
        this.schedulerForm = this.fb.group({
            examDate: ['', Validators.required],
            dailyStudyHours: [2, [Validators.required, Validators.min(1), Validators.max(24)]]
        });
    }

    ngOnInit(): void {
        this.schedulerService.schedule$.subscribe(s => {
            this.schedule = s;
            if (s.length > 0) this.isGenerated = true;
        });
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                this.fileError = 'Please upload a PDF file.';
                this.selectedFile = null;
                return;
            }
            this.selectedFile = file;
            this.fileError = null;
        }
    }

    generateSchedule(): void {
        if (this.schedulerForm.valid && this.selectedFile) {
            const formValue = this.schedulerForm.value;
            this.schedulerService.uploadSyllabus(
                this.selectedFile,
                new Date(formValue.examDate),
                formValue.dailyStudyHours
            ).subscribe();
        } else if (!this.selectedFile) {
            this.fileError = 'Please select a syllabus PDF first.';
        }
    }

    toggleTopic(topicId: string): void {
        this.schedulerService.toggleTopicCompletion(topicId);
    }

    getProgress(): number {
        if (this.schedule.length === 0) return 0;
        const allTopics = this.schedule.flatMap(d => d.topics);
        if (allTopics.length === 0) return 0;
        const completed = allTopics.filter(t => t.completed).length;
        return Math.round((completed / allTopics.length) * 100);
    }
}
