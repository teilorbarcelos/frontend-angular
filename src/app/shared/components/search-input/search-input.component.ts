import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div [class]="classes">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <lucide-angular [img]="SearchIcon" class="h-4 w-4 text-gray-400"></lucide-angular>
      </div>
      <input
        type="text"
        [formControl]="searchControl"
        [placeholder]="placeholder"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
      />
    </div>
  `,
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() className = '';
  @Output() searched = new EventEmitter<string>();

  readonly SearchIcon = Search;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  get classes() {
    return cn('relative rounded-md shadow-sm', this.className);
  }

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.searched.emit(value ?? '');
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
