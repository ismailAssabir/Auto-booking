// features/contacts/contactsSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Charger les contacts depuis localStorage au démarrage
const loadContactsFromStorage = () => {
    const saved = localStorage.getItem('contacts');
    return saved ? JSON.parse(saved) : [];
};

const initialState = {
    contacts: loadContactsFromStorage()
};

const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        // Ajouter un nouveau contact
        addContact: (state, action) => {
            const newContact = {
                id: state.contacts.length? Math.max(state.contacts.map(c=>c.id)) +1:1,
                ...action.payload,
                date: new Date().toISOString(),
                status: 'non lu',
                replies: [] // Pour stocker les réponses
            };
            
            state.contacts.push(newContact);
            
            // Sauvegarder dans localStorage
            localStorage.setItem('contacts', JSON.stringify(state.contacts));
        },

        // Supprimer un contact
        deleteContact: (state, action) => {
            state.contacts = state.contacts.filter(c => c.id !== action.payload);
            
            // Sauvegarder dans localStorage
            localStorage.setItem('contacts', JSON.stringify(state.contacts));
        },

        // Répondre à un contact
        replyToContact: (state, action) => {
            const { contactId, reply } = action.payload;
            const contact = state.contacts.find(c => c.id === contactId);
            
            if (contact) {
                // Ajouter la réponse
                contact.replies.push({
                    id: state.contacts.length? Math.max(state.contacts.map(c=>c.id)) +1:1,
                    message: reply,
                    date: new Date().toISOString()
                });
                
                // Mettre à jour le statut
                contact.status = 'répondu';
                
                // Sauvegarder dans localStorage
                localStorage.setItem('contacts', JSON.stringify(state.contacts));
            }
        }
    }
});

export const { addContact, deleteContact, replyToContact } = contactsSlice.actions;
export default contactsSlice.reducer;