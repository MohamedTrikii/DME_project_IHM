#!/bin/bash
# Script pour lancer le backend et le frontend

# Lancer le backend
(cd backend && npm start &)

# Lancer le frontend
(npm start &)
