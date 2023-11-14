import {create} from 'zustand'
import { Speech } from './models/speechInterface'

// This defines the data that will be returned when you call useSpeechesStore
interface SpeechesState {
    speeches: Speech[],
    setSpeeches: (speechesList: Speech[]) => void,
}

// Allows for global storage of speeches that can be accessed anywhere
export const useSpeechesStore = create<SpeechesState>((set) => (
    {
        speeches: [],
        setSpeeches: (speechesList:Speech[]) => set(()=>({speeches: speechesList})),
    }
))

/* Example Usage: 
import { useSpeechesStore } from './speechesStore';

*/