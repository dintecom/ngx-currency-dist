import { InputService } from './input.service';
export class InputHandler {
    constructor(htmlInputElement, options) {
        this.inputService = new InputService(htmlInputElement, options);
    }
    handleCut() {
        setTimeout(() => {
            this.inputService.updateFieldValue();
            this.setValue(this.inputService.value);
            this.onModelChange(this.inputService.value);
        }, 0);
    }
    handleInput() {
        const rawValue = this.inputService.rawValue ?? '';
        const selectionStart = this.inputService.inputSelection.selectionStart;
        const keyCode = rawValue.charCodeAt(selectionStart - 1);
        const rawValueLength = rawValue.length;
        const storedRawValueLength = this.inputService.storedRawValue.length;
        if (Math.abs(rawValueLength - storedRawValueLength) != 1) {
            this.inputService.updateFieldValue(selectionStart);
            this.onModelChange(this.inputService.value);
            return;
        }
        // Restore the old value.
        this.inputService.rawValue = this.inputService.storedRawValue;
        if (rawValueLength < storedRawValueLength) {
            // Chrome Android seems to move the cursor in response to a backspace AFTER processing the
            // input event, so we need to wrap this in a timeout.
            this.timer(() => {
                // Move the cursor to just after the deleted value.
                this.inputService.updateFieldValue(selectionStart + 1);
                // Then backspace it.
                this.inputService.removeNumber(8);
                this.onModelChange(this.inputService.value);
            }, 0);
        }
        if (rawValueLength > storedRawValueLength) {
            // Move the cursor to just before the new value.
            this.inputService.updateFieldValue(selectionStart - 1);
            // Process the character like a keypress.
            this._handleKeypressImpl(keyCode);
        }
    }
    handleKeydown(event) {
        const keyCode = event.which || event.charCode || event.keyCode;
        if (keyCode == 8 || keyCode == 46 || keyCode == 63272) {
            event.preventDefault();
            if (this.inputService.inputSelection.selectionStart <=
                this.inputService.prefixLength() &&
                this.inputService.inputSelection.selectionEnd >=
                    (this.inputService.rawValue?.length ?? 0) -
                        this.inputService.suffixLength()) {
                this.clearValue();
            }
            else {
                this.inputService.removeNumber(keyCode);
                this.onModelChange(this.inputService.value);
            }
        }
    }
    clearValue() {
        this.setValue(this.inputService.isNullable() ? null : 0);
        this.onModelChange(this.inputService.value);
    }
    handleKeypress(event) {
        const keyCode = event.which || event.charCode || event.keyCode;
        event.preventDefault();
        if (keyCode === 97 && event.ctrlKey) {
            return;
        }
        this._handleKeypressImpl(keyCode);
    }
    _handleKeypressImpl(keyCode) {
        switch (keyCode) {
            case undefined:
            case 9:
            case 13:
                return;
            case 43:
                this.inputService.changeToPositive();
                break;
            case 45:
                this.inputService.changeToNegative();
                break;
            default:
                if (this.inputService.canInputMoreNumbers) {
                    const selectionRangeLength = Math.abs(this.inputService.inputSelection.selectionEnd -
                        this.inputService.inputSelection.selectionStart);
                    if (selectionRangeLength == (this.inputService.rawValue?.length ?? 0)) {
                        this.setValue(null);
                    }
                    this.inputService.addNumber(keyCode);
                }
                break;
        }
        this.onModelChange(this.inputService.value);
    }
    handlePaste() {
        setTimeout(() => {
            this.inputService.updateFieldValue();
            this.setValue(this.inputService.value);
            this.onModelChange(this.inputService.value);
        }, 1);
    }
    updateOptions(options) {
        this.inputService.updateOptions(options);
    }
    getOnModelChange() {
        return this.onModelChange;
    }
    setOnModelChange(callbackFunction) {
        this.onModelChange = callbackFunction;
    }
    getOnModelTouched() {
        return this.onModelTouched;
    }
    setOnModelTouched(callbackFunction) {
        this.onModelTouched = callbackFunction;
    }
    setValue(value) {
        this.inputService.value = value;
    }
    /**
     * Passthrough to setTimeout that can be stubbed out in tests.
     */
    timer(callback, delayMilliseconds) {
        setTimeout(callback, delayMilliseconds);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jdXJyZW5jeS9zcmMvbGliL2lucHV0LmhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRy9DLE1BQU0sT0FBTyxZQUFZO0lBS3ZCLFlBQVksZ0JBQWtDLEVBQUUsT0FBMEI7UUFDeEUsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsU0FBUztRQUNQLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQsV0FBVztRQUNULE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUNsRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUM7UUFDdkUsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUN2QyxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQztRQUVyRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxH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SSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQsYUFBYSxDQUFDLE9BQTBCO1FBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztJQUVELGdCQUFnQixDQUFDLGdCQUFnRDtRQUMvRCxJQUFJLENBQUMsYUFBYSxHQUFHLGdCQUFnQixDQUFDO0lBQ3hDLENBQUM7SUFFRCxpQkFBaUI7UUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDN0IsQ0FBQztJQUVELGlCQUFpQixDQUFDLGdCQUE0QjtRQUM1QyxJQUFJLENBQUMsY0FBYyxHQUFHLGdCQUFnQixDQUFDO0lBQ3pDLENBQUM7SUFFRCxRQUFRLENBQUMsS0FBb0I7UUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxRQUFvQixFQUFFLGlCQUF5QjtRQUNuRCxVQUFVLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5wdXRTZXJ2aWNlIH0gZnJvbSAnLi9pbnB1dC5zZXJ2aWNlJztcbmltcG9ydCB7IE5neEN1cnJlbmN5Q29uZmlnIH0gZnJvbSAnLi9uZ3gtY3VycmVuY3kuY29uZmlnJztcblxuZXhwb3J0IGNsYXNzIElucHV0SGFuZGxlciB7XG4gIGlucHV0U2VydmljZTogSW5wdXRTZXJ2aWNlO1xuICBvbk1vZGVsQ2hhbmdlITogKHZhbHVlOiBudW1iZXIgfCBudWxsKSA9PiB2b2lkO1xuICBvbk1vZGVsVG91Y2hlZCE6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoaHRtbElucHV0RWxlbWVudDogSFRNTElucHV0RWxlbWVudCwgb3B0aW9uczogTmd4Q3VycmVuY3lDb25maWcpIHtcbiAgICB0aGlzLmlucHV0U2VydmljZSA9IG5ldyBJbnB1dFNlcnZpY2UoaHRtbElucHV0RWxlbWVudCwgb3B0aW9ucyk7XG4gIH1cblxuICBoYW5kbGVDdXQoKTogdm9pZCB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmlucHV0U2VydmljZS51cGRhdGVGaWVsZFZhbHVlKCk7XG4gICAgICB0aGlzLnNldFZhbHVlKHRoaXMuaW5wdXRTZXJ2aWNlLnZhbHVlKTtcbiAgICAgIHRoaXMub25Nb2RlbENoYW5nZSh0aGlzLmlucHV0U2VydmljZS52YWx1ZSk7XG4gICAgfSwgMCk7XG4gIH1cblxuICBoYW5kbGVJbnB1dCgpOiB2b2lkIHtcbiAgICBjb25zdCByYXdWYWx1ZSA9IHRoaXMuaW5wdXRTZXJ2aWNlLnJhd1ZhbHVlID8/ICcnO1xuICAgIGNvbnN0IHNlbGVjdGlvblN0YXJ0ID0gdGhpcy5pbnB1dFNlcnZpY2UuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uU3RhcnQ7XG4gICAgY29uc3Qga2V5Q29kZSA9IHJhd1ZhbHVlLmNoYXJDb2RlQXQoc2VsZWN0aW9uU3RhcnQgLSAxKTtcbiAgICBjb25zdCByYXdWYWx1ZUxlbmd0aCA9IHJhd1ZhbHVlLmxlbmd0aDtcbiAgICBjb25zdCBzdG9yZWRSYXdWYWx1ZUxlbmd0aCA9IHRoaXMuaW5wdXRTZXJ2aWNlLnN0b3JlZFJhd1ZhbHVlLmxlbmd0aDtcblxuICAgIGlmIChNYXRoLmFicyhyYXdWYWx1ZUxlbmd0aCAtIHN0b3JlZFJhd1ZhbHVlTGVuZ3RoKSAhPSAxKSB7XG4gICAgICB0aGlzLmlucHV0U2VydmljZS51cGRhdGVGaWVsZFZhbHVlKHNlbGVjdGlvblN0YXJ0KTtcbiAgICAgIHRoaXMub25Nb2RlbENoYW5nZSh0aGlzLmlucHV0U2VydmljZS52YWx1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVzdG9yZSB0aGUgb2xkIHZhbHVlLlxuICAgIHRoaXMuaW5wdXRTZXJ2aWNlLnJhd1ZhbHVlID0gdGhpcy5pbnB1dFNlcnZpY2Uuc3RvcmVkUmF3VmFsdWU7XG5cbiAgICBpZiAocmF3VmFsdWVMZW5ndGggPCBzdG9yZWRSYXdWYWx1ZUxlbmd0aCkge1xuICAgICAgLy8gQ2hyb21lIEFuZHJvaWQgc2VlbXMgdG8gbW92ZSB0aGUgY3Vyc29yIGluIHJlc3BvbnNlIHRvIGEgYmFja3NwYWNlIEFGVEVSIHByb2Nlc3NpbmcgdGhlXG4gICAgICAvLyBpbnB1dCBldmVudCwgc28gd2UgbmVlZCB0byB3cmFwIHRoaXMgaW4gYSB0aW1lb3V0LlxuICAgICAgdGhpcy50aW1lcigoKSA9PiB7XG4gICAgICAgIC8vIE1vdmUgdGhlIGN1cnNvciB0byBqdXN0IGFmdGVyIHRoZSBkZWxldGVkIHZhbHVlLlxuICAgICAgICB0aGlzLmlucHV0U2VydmljZS51cGRhdGVGaWVsZFZhbHVlKHNlbGVjdGlvblN0YXJ0ICsgMSk7XG5cbiAgICAgICAgLy8gVGhlbiBiYWNrc3BhY2UgaXQuXG4gICAgICAgIHRoaXMuaW5wdXRTZXJ2aWNlLnJlbW92ZU51bWJlcig4KTtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMuaW5wdXRTZXJ2aWNlLnZhbHVlKTtcbiAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIGlmIChyYXdWYWx1ZUxlbmd0aCA+IHN0b3JlZFJhd1ZhbHVlTGVuZ3RoKSB7XG4gICAgICAvLyBNb3ZlIHRoZSBjdXJzb3IgdG8ganVzdCBiZWZvcmUgdGhlIG5ldyB2YWx1ZS5cbiAgICAgIHRoaXMuaW5wdXRTZXJ2aWNlLnVwZGF0ZUZpZWxkVmFsdWUoc2VsZWN0aW9uU3RhcnQgLSAxKTtcblxuICAgICAgLy8gUHJvY2VzcyB0aGUgY2hhcmFjdGVyIGxpa2UgYSBrZXlwcmVzcy5cbiAgICAgIHRoaXMuX2hhbmRsZUtleXByZXNzSW1wbChrZXlDb2RlKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmNoYXJDb2RlIHx8IGV2ZW50LmtleUNvZGU7XG4gICAgaWYgKGtleUNvZGUgPT0gOCB8fCBrZXlDb2RlID09IDQ2IHx8IGtleUNvZGUgPT0gNjMyNzIpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5pbnB1dFNlcnZpY2UuaW5wdXRTZWxlY3Rpb24uc2VsZWN0aW9uU3RhcnQgPD1cbiAgICAgICAgICB0aGlzLmlucHV0U2VydmljZS5wcmVmaXhMZW5ndGgoKSAmJlxuICAgICAgICB0aGlzLmlucHV0U2VydmljZS5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25FbmQgPj1cbiAgICAgICAgICAodGhpcy5pbnB1dFNlcnZpY2UucmF3VmFsdWU/Lmxlbmd0aCA/PyAwKSAtXG4gICAgICAgICAgICB0aGlzLmlucHV0U2VydmljZS5zdWZmaXhMZW5ndGgoKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuY2xlYXJWYWx1ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnB1dFNlcnZpY2UucmVtb3ZlTnVtYmVyKGtleUNvZGUpO1xuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UodGhpcy5pbnB1dFNlcnZpY2UudmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNsZWFyVmFsdWUoKSB7XG4gICAgdGhpcy5zZXRWYWx1ZSh0aGlzLmlucHV0U2VydmljZS5pc051bGxhYmxlKCkgPyBudWxsIDogMCk7XG4gICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMuaW5wdXRTZXJ2aWNlLnZhbHVlKTtcbiAgfVxuXG4gIGhhbmRsZUtleXByZXNzKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmNoYXJDb2RlIHx8IGV2ZW50LmtleUNvZGU7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoa2V5Q29kZSA9PT0gOTcgJiYgZXZlbnQuY3RybEtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2hhbmRsZUtleXByZXNzSW1wbChrZXlDb2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZUtleXByZXNzSW1wbChrZXlDb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgY2FzZSA5OlxuICAgICAgY2FzZSAxMzpcbiAgICAgICAgcmV0dXJuO1xuICAgICAgY2FzZSA0MzpcbiAgICAgICAgdGhpcy5pbnB1dFNlcnZpY2UuY2hhbmdlVG9Qb3NpdGl2ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDU6XG4gICAgICAgIHRoaXMuaW5wdXRTZXJ2aWNlLmNoYW5nZVRvTmVnYXRpdmUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodGhpcy5pbnB1dFNlcnZpY2UuY2FuSW5wdXRNb3JlTnVtYmVycykge1xuICAgICAgICAgIGNvbnN0IHNlbGVjdGlvblJhbmdlTGVuZ3RoID0gTWF0aC5hYnMoXG4gICAgICAgICAgICB0aGlzLmlucHV0U2VydmljZS5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25FbmQgLVxuICAgICAgICAgICAgICB0aGlzLmlucHV0U2VydmljZS5pbnB1dFNlbGVjdGlvbi5zZWxlY3Rpb25TdGFydCxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgc2VsZWN0aW9uUmFuZ2VMZW5ndGggPT0gKHRoaXMuaW5wdXRTZXJ2aWNlLnJhd1ZhbHVlPy5sZW5ndGggPz8gMClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUobnVsbCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5pbnB1dFNlcnZpY2UuYWRkTnVtYmVyKGtleUNvZGUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMub25Nb2RlbENoYW5nZSh0aGlzLmlucHV0U2VydmljZS52YWx1ZSk7XG4gIH1cblxuICBoYW5kbGVQYXN0ZSgpOiB2b2lkIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuaW5wdXRTZXJ2aWNlLnVwZGF0ZUZpZWxkVmFsdWUoKTtcbiAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5pbnB1dFNlcnZpY2UudmFsdWUpO1xuICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMuaW5wdXRTZXJ2aWNlLnZhbHVlKTtcbiAgICB9LCAxKTtcbiAgfVxuXG4gIHVwZGF0ZU9wdGlvbnMob3B0aW9uczogTmd4Q3VycmVuY3lDb25maWcpOiB2b2lkIHtcbiAgICB0aGlzLmlucHV0U2VydmljZS51cGRhdGVPcHRpb25zKG9wdGlvbnMpO1xuICB9XG5cbiAgZ2V0T25Nb2RlbENoYW5nZSgpOiAodmFsdWU6IG51bWJlciB8IG51bGwpID0+IHZvaWQge1xuICAgIHJldHVybiB0aGlzLm9uTW9kZWxDaGFuZ2U7XG4gIH1cblxuICBzZXRPbk1vZGVsQ2hhbmdlKGNhbGxiYWNrRnVuY3Rpb246ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMub25Nb2RlbENoYW5nZSA9IGNhbGxiYWNrRnVuY3Rpb247XG4gIH1cblxuICBnZXRPbk1vZGVsVG91Y2hlZCgpOiAoKSA9PiB2b2lkIHtcbiAgICByZXR1cm4gdGhpcy5vbk1vZGVsVG91Y2hlZDtcbiAgfVxuXG4gIHNldE9uTW9kZWxUb3VjaGVkKGNhbGxiYWNrRnVuY3Rpb246ICgpID0+IHZvaWQpIHtcbiAgICB0aGlzLm9uTW9kZWxUb3VjaGVkID0gY2FsbGJhY2tGdW5jdGlvbjtcbiAgfVxuXG4gIHNldFZhbHVlKHZhbHVlOiBudW1iZXIgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5pbnB1dFNlcnZpY2UudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXNzdGhyb3VnaCB0byBzZXRUaW1lb3V0IHRoYXQgY2FuIGJlIHN0dWJiZWQgb3V0IGluIHRlc3RzLlxuICAgKi9cbiAgdGltZXIoY2FsbGJhY2s6ICgpID0+IHZvaWQsIGRlbGF5TWlsbGlzZWNvbmRzOiBudW1iZXIpIHtcbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBkZWxheU1pbGxpc2Vjb25kcyk7XG4gIH1cbn1cbiJdfQ==