curl -H "Content-Type: application/json" -d '{"username": "Qify Status", "content": "Qify is building"}' "https://discord.com/api/webhooks/912785030378561626/NGWTq9G6Eb2fUqi6Aatq55fxAusLB5fg2nlayo_WhgbOzB5qnSUDHcjADDsP4ooOvA2C"
npm run build && \
    curl -H "Content-Type: application/json" -d '{"username": "Qify Status", "content": "<@289145021922279425> Qify is up and running"}' "https://discord.com/api/webhooks/912785030378561626/NGWTq9G6Eb2fUqi6Aatq55fxAusLB5fg2nlayo_WhgbOzB5qnSUDHcjADDsP4ooOvA2C" && \
    npm run start
