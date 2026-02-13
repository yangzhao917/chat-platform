import { defineStore } from 'pinia';
import { ref } from 'vue';
import { characterApi } from '@/api';
export const useCharacterStore = defineStore('character', () => {
    const characters = ref([]);
    const currentCharacter = ref(null);
    const loading = ref(false);
    const fetchCharacters = async () => {
        loading.value = true;
        try {
            const response = await characterApi.getAll();
            characters.value = response.data;
        }
        finally {
            loading.value = false;
        }
    };
    const selectCharacter = async (id) => {
        loading.value = true;
        try {
            const response = await characterApi.getOne(id);
            currentCharacter.value = response.data;
        }
        finally {
            loading.value = false;
        }
    };
    const createCharacter = async (data) => {
        loading.value = true;
        try {
            const response = await characterApi.create(data);
            characters.value.unshift(response.data);
            return response.data;
        }
        finally {
            loading.value = false;
        }
    };
    const deleteCharacter = async (id) => {
        loading.value = true;
        try {
            await characterApi.delete(id);
            characters.value = characters.value.filter(c => c.id !== id);
            if (currentCharacter.value?.id === id) {
                currentCharacter.value = null;
            }
        }
        finally {
            loading.value = false;
        }
    };
    return {
        characters,
        currentCharacter,
        loading,
        fetchCharacters,
        selectCharacter,
        createCharacter,
        deleteCharacter,
    };
});
