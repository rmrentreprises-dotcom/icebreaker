"""Curated icebreaker library: 500+ lines across categories x tones x languages."""

# Categories with metadata
CATEGORIES = [
    {"id": "beach", "name_en": "Beach", "name_fr": "Plage", "icon": "Waves"},
    {"id": "club", "name_en": "Club", "name_fr": "Club", "icon": "Music"},
    {"id": "cafe", "name_en": "Café", "name_fr": "Café", "icon": "Coffee"},
    {"id": "gym", "name_en": "Gym", "name_fr": "Salle de sport", "icon": "Dumbbell"},
    {"id": "park", "name_en": "Park", "name_fr": "Parc", "icon": "Trees"},
    {"id": "travel", "name_en": "Travel", "name_fr": "Voyage", "icon": "Plane"},
    {"id": "bar", "name_en": "Bar", "name_fr": "Bar", "icon": "Wine"},
    {"id": "restaurant", "name_en": "Restaurant", "name_fr": "Restaurant", "icon": "Utensils"},
    {"id": "bookstore", "name_en": "Bookstore", "name_fr": "Librairie", "icon": "BookOpen"},
    {"id": "concert", "name_en": "Concert", "name_fr": "Concert", "icon": "Mic"},
    {"id": "gallery", "name_en": "Gallery", "name_fr": "Galerie", "icon": "Image"},
    {"id": "coworking", "name_en": "Coworking", "name_fr": "Coworking", "icon": "Laptop"},
    {"id": "wedding", "name_en": "Wedding", "name_fr": "Mariage", "icon": "Heart"},
    {"id": "hotel", "name_en": "Hotel Lobby", "name_fr": "Hall d'hôtel", "icon": "Hotel"},
    {"id": "transit", "name_en": "Transit", "name_fr": "Transports", "icon": "Train"},
]

TONES = ["funny", "romantic", "casual", "bold", "witty", "sweet"]

# 6 lines per (category x tone x language) -> 15 * 6 * 2 * ~3 = ~540
# I'll write 3 lines per cell in EN and 3 in FR for each tone
LIBRARY = {
    "beach": {
        "funny": {
            "en": [
                "If you build a sandcastle that beautiful, can I be your royal architect?",
                "Quick question — is the ocean stalking you, or are you just naturally drawn to better views?",
                "I'm not a lifeguard, but I'd happily save you from a boring afternoon.",
            ],
            "fr": [
                "Si tu construis un château de sable aussi beau, je peux être ton architecte royal ?",
                "Petite question — l'océan te suit ou tu attires juste les belles vues ?",
                "Je suis pas maître-nageur, mais je peux te sauver d'un après-midi ennuyeux.",
            ],
        },
        "romantic": {
            "en": [
                "The sunset is impressive, but honestly, you're stealing the spotlight.",
                "I came here to clear my head — then you walked by and made it worse.",
                "Some waves are unforgettable. You feel like one of them.",
            ],
            "fr": [
                "Le coucher de soleil est sublime, mais franchement, tu lui voles la vedette.",
                "Je suis venu pour me changer les idées — tu es passée et c'est raté.",
                "Certaines vagues restent gravées. Tu en es une.",
            ],
        },
        "casual": {
            "en": [
                "Local recommendation? Best beach spot you've found here?",
                "First time at this beach or you come here often?",
                "Mind if I ask — what's the water like today?",
            ],
            "fr": [
                "Recommandation locale ? Le meilleur coin de plage selon toi ?",
                "Première fois ici ou tu viens souvent ?",
                "Petite question — l'eau est comment aujourd'hui ?",
            ],
        },
        "bold": {
            "en": [
                "I'm going to regret it forever if I don't say hi. So — hi.",
                "Direct question: coffee tomorrow or are you taken?",
                "I noticed you from across the beach. Worth the walk?",
            ],
            "fr": [
                "Je vais le regretter toute ma vie si je dis pas bonjour. Alors — bonjour.",
                "Question directe : un café demain ou t'es prise ?",
                "Je t'ai remarquée de l'autre côté de la plage. Ça valait la marche ?",
            ],
        },
        "witty": {
            "en": [
                "Statistically, you're the most interesting thing on this beach. I checked.",
                "I have two theories about you. Care to help me eliminate one?",
                "You look like trouble — the good kind. Confirm or deny?",
            ],
            "fr": [
                "Statistiquement, tu es la chose la plus intéressante de cette plage. J'ai vérifié.",
                "J'ai deux théories sur toi. Tu m'aides à en éliminer une ?",
                "Tu as l'air d'être un beau problème. Confirmation ?",
            ],
        },
        "sweet": {
            "en": [
                "Your smile honestly fits the weather perfectly.",
                "I just wanted to say you have great energy — have a beautiful day.",
                "Hope this isn't weird — you brighten up the view.",
            ],
            "fr": [
                "Ton sourire va parfaitement avec la météo.",
                "Je voulais juste te dire que tu as une belle énergie — bonne journée.",
                "J'espère que c'est pas bizarre — tu illumines le paysage.",
            ],
        },
    },
    "club": {
        "funny": {
            "en": [
                "I was going to try a smooth move, but my dance moves spoke first.",
                "If we're both going to pretend we know this song, we should team up.",
                "Quick — pretend you know me, my ex just walked in. (Just kidding. Hi.)",
            ],
            "fr": [
                "J'allais tenter un truc smooth, mais mes pas de danse ont parlé en premier.",
                "Si on doit faire semblant de connaître cette chanson, autant le faire ensemble.",
                "Vite — fais comme si tu me connaissais, mon ex vient d'arriver. (Je rigole. Salut.)",
            ],
        },
        "romantic": {
            "en": [
                "There are 200 people here, and I noticed only one. That's you.",
                "The DJ is good, but you're the actual reason I haven't left.",
                "I'd rather skip the small talk and just ask you to dance.",
            ],
            "fr": [
                "On est 200 ici et j'ai remarqué qu'une seule personne. Toi.",
                "Le DJ est bon, mais c'est toi la vraie raison pour laquelle je suis resté.",
                "Je préfère sauter les banalités et te demander de danser.",
            ],
        },
        "casual": {
            "en": [
                "First time here? The vibe's different on weeknights.",
                "Friend's birthday or just a random Friday for you?",
                "Honest take — is this DJ actually good or are we drunk?",
            ],
            "fr": [
                "Première fois ici ? L'ambiance est différente en semaine.",
                "Anniversaire d'un ami ou un vendredi normal pour toi ?",
                "Honnêtement — il est bon ce DJ ou on est juste bourrés ?",
            ],
        },
        "bold": {
            "en": [
                "I'm bad at clubs. But I'm great at conversations. Let's switch venues?",
                "I came over because standing across the room felt like a waste.",
                "One drink, one dance, one conversation. Pick the order.",
            ],
            "fr": [
                "Je suis nul en boîte. Mais excellent en conversation. On change d'endroit ?",
                "Je suis venu parce que rester de l'autre côté me semblait gâché.",
                "Un verre, une danse, une conversation. Choisis l'ordre.",
            ],
        },
        "witty": {
            "en": [
                "You dance like someone who knows exactly what they want. Refreshing.",
                "I have a rule about clubs: I don't approach. You broke the rule.",
                "Your aura has way better lighting than this place.",
            ],
            "fr": [
                "Tu danses comme quelqu'un qui sait ce qu'il veut. Rafraîchissant.",
                "J'ai une règle en boîte : je n'aborde personne. Tu as cassé la règle.",
                "Ton aura a un meilleur éclairage que ce club.",
            ],
        },
        "sweet": {
            "en": [
                "I just wanted to say you look like you're having the best night.",
                "Your laugh cut through the bass — figured I should say hi.",
                "I'd love to know your name before this song ends.",
            ],
            "fr": [
                "Je voulais juste te dire que tu as l'air de passer la meilleure soirée.",
                "Ton rire est passé à travers la basse — je devais venir te dire salut.",
                "J'aimerais connaître ton prénom avant la fin de cette chanson.",
            ],
        },
    },
    "cafe": {
        "funny": {
            "en": [
                "Quick survey: is this the best coffee you've had today, or am I about to make a huge mistake?",
                "I was going to read, but eavesdropping on your laugh has been better.",
                "I tipped the barista to point out the most interesting person here. They pointed at you.",
            ],
            "fr": [
                "Petit sondage : c'est le meilleur café de ta journée, ou je suis sur le point de faire une erreur ?",
                "J'allais lire, mais écouter ton rire est plus intéressant.",
                "J'ai donné un pourboire au barista pour qu'il me montre la personne la plus intéressante. Il t'a montrée.",
            ],
        },
        "romantic": {
            "en": [
                "I picked this seat for the window. Then you sat down. Best decision I made today.",
                "If your day's been half as good as you make this place look, you're winning.",
                "Some people read books. I'm reading the way you stir your coffee. It's poetry.",
            ],
            "fr": [
                "J'ai choisi cette place pour la fenêtre. Puis tu t'es assise. Meilleure décision de ma journée.",
                "Si ta journée est moitié aussi belle que toi dans cet endroit, tu es la gagnante.",
                "Certains lisent des livres. Je regarde la façon dont tu remues ton café. C'est de la poésie.",
            ],
        },
        "casual": {
            "en": [
                "What are you drinking? I always pick wrong here.",
                "Local? I need a recommendation for somewhere quieter than this.",
                "Working on something interesting or just hiding from the world?",
            ],
            "fr": [
                "Tu prends quoi ? Je choisis toujours mal ici.",
                "T'es du coin ? Je cherche un endroit plus calme que celui-là.",
                "Tu bosses sur un truc intéressant ou tu te caches du monde ?",
            ],
        },
        "bold": {
            "en": [
                "I came over because I'd rather embarrass myself than wonder later.",
                "Ten seconds of your time — what's your name?",
                "If you say no, I'll politely vanish. But: coffee, properly, sometime?",
            ],
            "fr": [
                "Je viens te voir parce que je préfère me planter que regretter plus tard.",
                "Dix secondes de ton temps — c'est quoi ton prénom ?",
                "Si tu dis non, je disparais poliment. Mais : un vrai café, un de ces jours ?",
            ],
        },
        "witty": {
            "en": [
                "I have a theory that people who order tea here have better stories. Defend yourself.",
                "Your book choice tells me you're either dangerous or fascinating. Hopefully both.",
                "I'd ask what you're working on but I'd rather guess wrong on purpose.",
            ],
            "fr": [
                "J'ai une théorie : ceux qui prennent du thé ici ont de meilleures histoires. Défends-toi.",
                "Ton choix de livre me dit que tu es soit dangereuse soit fascinante. J'espère les deux.",
                "Je te demanderais sur quoi tu travailles, mais je préfère deviner faux exprès.",
            ],
        },
        "sweet": {
            "en": [
                "I just wanted to compliment your style — that scarf is on point.",
                "You have a really kind face. Felt rude not to say it.",
                "Hope your day's going as well as you're making this corner look.",
            ],
            "fr": [
                "Je voulais juste te complimenter sur ton style — ton écharpe est parfaite.",
                "Tu as un visage très doux. C'était impoli de pas te le dire.",
                "J'espère que ta journée est aussi belle que ce coin grâce à toi.",
            ],
        },
    },
    "gym": {
        "funny": {
            "en": [
                "I'm pretending to know what I'm doing. You looked like a witness.",
                "Quick question for legal reasons — is your form actually that good or are you a personal trainer in disguise?",
                "If I drop this dumbbell on my foot, will you call an ambulance? Just want a friend.",
            ],
            "fr": [
                "Je fais semblant de savoir ce que je fais. T'avais l'air d'un témoin.",
                "Question pour des raisons légales — ta technique est vraie ou t'es coach déguisée ?",
                "Si je me lâche cet haltère sur le pied, tu appelles l'ambulance ? Je veux juste un ami.",
            ],
        },
        "romantic": {
            "en": [
                "Don't take this the wrong way — but you make this place look better than the brochure.",
                "I came in tired. One look and suddenly I have energy. Explain that.",
                "I'm not a fan of cardio, but I'd run a marathon to find your name.",
            ],
            "fr": [
                "Le prends pas mal — mais tu rends cet endroit plus beau que la pub.",
                "Je suis entré fatigué. Un regard et j'ai de l'énergie. Explique ça.",
                "Je suis pas fan du cardio, mais je courrais un marathon pour ton prénom.",
            ],
        },
        "casual": {
            "en": [
                "Mind sharing this rack when you're done? No rush.",
                "How long have you been training here? Trying to figure out the busy hours.",
                "Quick advice — leg day or skip leg day? I need a real answer.",
            ],
            "fr": [
                "Tu partages le rack quand t'as fini ? Pas pressé.",
                "Tu t'entraînes ici depuis longtemps ? J'essaie de comprendre les heures de pointe.",
                "Conseil rapide — leg day ou je saute ? J'ai besoin d'une vraie réponse.",
            ],
        },
        "bold": {
            "en": [
                "Going to be straight: I noticed you the moment I walked in. Coffee after?",
                "I'm not great at gym etiquette but I'd love to know your name.",
                "We've made eye contact three times. I'm fixing the awkwardness.",
            ],
            "fr": [
                "Je vais être direct : je t'ai remarquée dès que je suis entré. Un café après ?",
                "Je suis pas un pro de la salle, mais j'aimerais connaître ton prénom.",
                "On s'est croisés du regard trois fois. Je casse le malaise.",
            ],
        },
        "witty": {
            "en": [
                "You lift like someone with a strong personality. Theory confirmed?",
                "I came for the workout, but I'm staying for the unexpected motivation.",
                "I'd ask for tips, but I think the real tip is to talk to you longer.",
            ],
            "fr": [
                "Tu soulèves comme quelqu'un de caractère. Théorie confirmée ?",
                "Je suis venu pour le sport, je reste pour la motivation inattendue.",
                "Je te demanderais des conseils, mais le vrai conseil c'est de te parler plus longtemps.",
            ],
        },
        "sweet": {
            "en": [
                "Your discipline is inspiring — just wanted to say that.",
                "Wanted to wish you a good session before I head out.",
                "You make this place feel less intimidating, honestly.",
            ],
            "fr": [
                "Ta discipline est inspirante — je voulais juste le dire.",
                "Je voulais te souhaiter une bonne séance avant de partir.",
                "Tu rends cet endroit moins intimidant, franchement.",
            ],
        },
    },
    "park": {
        "funny": {
            "en": [
                "Is your dog single? Mine's looking. (I'm also looking.)",
                "I tried meditating for twenty minutes. You broke my concentration in two seconds.",
                "Quick survey: how many ducks does it take to make this park magical? I think one of you.",
            ],
            "fr": [
                "Ton chien est célibataire ? Le mien cherche. (Moi aussi je cherche.)",
                "J'ai essayé de méditer 20 minutes. Tu m'as déconcentré en 2 secondes.",
                "Sondage : combien de canards pour rendre ce parc magique ? Je crois qu'un seul de toi.",
            ],
        },
        "romantic": {
            "en": [
                "The whole park is beautiful, and somehow you still stand out.",
                "I'd offer to share my bench, but I'd rather offer to share the afternoon.",
                "If picnics had a face, it'd be yours. That's a compliment, I think.",
            ],
            "fr": [
                "Tout le parc est beau, et pourtant tu te distingues.",
                "Je te proposerais mon banc, mais je préfère te proposer l'après-midi.",
                "Si les pique-niques avaient un visage, ce serait le tien. C'est un compliment, je crois.",
            ],
        },
        "casual": {
            "en": [
                "Is this your usual spot? I'm new to this park.",
                "Any chance you know if there's good coffee nearby?",
                "Beautiful weather, right? Good day to be outside.",
            ],
            "fr": [
                "C'est ton coin habituel ? Je découvre ce parc.",
                "Tu connais un bon café dans le coin ?",
                "Belle météo, hein ? Bonne journée pour être dehors.",
            ],
        },
        "bold": {
            "en": [
                "I'd kick myself for not saying this — you're stunning. What's your name?",
                "Walk with me? Promise I'm not weird, just unusually direct.",
                "I figured a sunny day deserves a brave move. So: hi.",
            ],
            "fr": [
                "Je m'en voudrais de pas le dire — tu es magnifique. C'est quoi ton prénom ?",
                "On marche ensemble ? Promis je suis pas bizarre, juste très direct.",
                "Je me suis dit qu'une belle journée mérite un peu de courage. Alors : salut.",
            ],
        },
        "witty": {
            "en": [
                "I'm convinced people who hang out in parks alone are the most interesting. Convince me I'm right.",
                "Your book/dog/headphones (pick one) tells me a story. Want to confirm or correct it?",
                "There's a 0% chance you're as boring as you look relaxed. Prove it.",
            ],
            "fr": [
                "Je suis convaincu que les gens qui traînent seuls au parc sont les plus intéressants. Convaincs-moi.",
                "Ton livre/chien/écouteurs me raconte une histoire. Tu confirmes ou tu corriges ?",
                "Il y a 0% de chances que tu sois aussi ennuyeuse que tu as l'air détendue. Prouve-le.",
            ],
        },
        "sweet": {
            "en": [
                "Just wanted to say I love your energy — it suits the day.",
                "You make the park look like a postcard, you know that?",
                "Hope your day is as peaceful as you look right now.",
            ],
            "fr": [
                "Je voulais te dire que ton énergie est belle — elle va avec la journée.",
                "Tu rends le parc digne d'une carte postale, tu le sais ?",
                "J'espère que ta journée est aussi paisible que toi maintenant.",
            ],
        },
    },
    "travel": {
        "funny": {
            "en": [
                "We're two Canadians lost in this country. You look like a local. Help us not embarrass ourselves?",
                "Quick — recommend us one place to eat or we're committing tourist crimes tonight.",
                "I'm collecting accents. Yours is officially my favorite so far.",
            ],
            "fr": [
                "On est deux Canadiens perdus dans ce pays. T'as l'air d'une locale. Aide-nous à pas nous ridiculiser ?",
                "Vite — recommande un resto ou on commet des crimes touristiques ce soir.",
                "Je collectionne les accents. Le tien est officiellement mon préféré.",
            ],
        },
        "romantic": {
            "en": [
                "I came here to see the country. I'm starting to think you're the highlight.",
                "Of all the places in this city — somehow we ended up in the same one. Coincidence?",
                "I'll remember this trip. I have a feeling I'll remember you longer.",
            ],
            "fr": [
                "Je suis venu pour découvrir le pays. Je commence à croire que c'est toi le clou du voyage.",
                "Parmi tous les endroits de cette ville — on s'est retrouvés au même. Hasard ?",
                "Je me souviendrai de ce voyage. Je crois que je me souviendrai de toi plus longtemps.",
            ],
        },
        "casual": {
            "en": [
                "Are you local? My friend and I are visiting and need real recommendations, not Google.",
                "How long have you been here? We just landed and we're overwhelmed (in a good way).",
                "Honest opinion — what's the one thing tourists always miss?",
            ],
            "fr": [
                "T'es du coin ? Mon pote et moi on visite et on cherche de vraies recommandations, pas Google.",
                "Tu es là depuis longtemps ? On vient d'arriver, c'est intense (dans le bon sens).",
                "Avis honnête — qu'est-ce que les touristes ratent toujours ?",
            ],
        },
        "bold": {
            "en": [
                "I'm only here for a few days. Worst case I leave with a great memory. Coffee?",
                "Vacation rule: regret nothing. So I'm coming over to say hi.",
                "We're two travelers, you look like fun. Join us for a drink later?",
            ],
            "fr": [
                "Je suis là quelques jours. Au pire, je repars avec un bon souvenir. Un café ?",
                "Règle des vacances : aucun regret. Donc je viens dire salut.",
                "On est deux voyageurs, tu as l'air sympa. Tu nous rejoins pour un verre plus tard ?",
            ],
        },
        "witty": {
            "en": [
                "You either live here or you've mastered the local stare. Which is it?",
                "I came for the architecture. Staying for the unexpected plot twist (you).",
                "Trip itinerary update: insert one conversation with you. Approved?",
            ],
            "fr": [
                "Soit tu vis ici, soit tu maîtrises le regard local. Lequel ?",
                "Je suis venu pour l'architecture. Je reste pour le rebondissement inattendu (toi).",
                "Mise à jour itinéraire : ajouter une conversation avec toi. Approuvé ?",
            ],
        },
        "sweet": {
            "en": [
                "Your country is beautiful. You're a great representative of it.",
                "We're new here — wanted to thank a local for the warm vibes.",
                "You made our first day here feel less foreign. Thank you.",
            ],
            "fr": [
                "Ton pays est magnifique. Tu en es une belle ambassadrice.",
                "On est nouveaux ici — je voulais remercier une locale pour la chaleur.",
                "Tu as rendu notre premier jour ici moins étranger. Merci.",
            ],
        },
    },
    "bar": {
        "funny": {
            "en": [
                "I bet I can guess your drink order. Wrong? I buy. Right? You let me sit down.",
                "If you say 'old fashioned,' I'll respect you forever. If you say 'White Claw,' I'll still respect you. Slightly less.",
                "Quick — pretend you know me, the bartender thinks I'm boring.",
            ],
            "fr": [
                "Je parie que je devine ton verre. Faux ? J'offre. Juste ? Tu me laisses m'asseoir.",
                "Si tu dis 'Old Fashioned', je te respecterai à vie. Si tu dis 'White Claw', je te respecterai un peu moins.",
                "Vite — fais comme si tu me connaissais, le barman me trouve ennuyeux.",
            ],
        },
        "romantic": {
            "en": [
                "I'd offer to buy you a drink, but honestly your company would be the better deal.",
                "Of all the conversations in this room, yours is the only one I want to hear.",
                "I came in for one drink. You're making me reconsider the night.",
            ],
            "fr": [
                "Je te proposerais un verre, mais ta compagnie serait le meilleur deal.",
                "Parmi toutes les conversations ici, la tienne est la seule que je veux entendre.",
                "Je suis venu pour un verre. Tu me fais reconsidérer la soirée.",
            ],
        },
        "casual": {
            "en": [
                "What are you drinking? Looking for ideas.",
                "Is this place usually this packed on a Thursday?",
                "Friend hasn't shown up yet — mind if I park here for a sec?",
            ],
            "fr": [
                "Tu prends quoi ? Je cherche une idée.",
                "C'est toujours plein comme ça un jeudi ?",
                "Mon ami est pas encore là — je peux squatter une minute ?",
            ],
        },
        "bold": {
            "en": [
                "I'm not the type to hover — so I'll be direct. Want some company?",
                "If I don't say hi now, I'll regret it during my drink. So: hi.",
                "Trade you a drink for a conversation. Fair deal?",
            ],
            "fr": [
                "Je suis pas du genre à tourner autour — alors direct. Tu veux de la compagnie ?",
                "Si je dis pas salut maintenant, je vais le regretter dans mon verre. Salut.",
                "Je t'échange un verre contre une conversation. Deal ?",
            ],
        },
        "witty": {
            "en": [
                "Your drink choice is either bold or wrong. I'll need a defense.",
                "I have a theory you're the most interesting person in the room. Help me prove it.",
                "Bartender pointed at you when I asked who's worth talking to. Confirmed?",
            ],
            "fr": [
                "Ton choix de verre est soit audacieux soit faux. J'attends ta défense.",
                "J'ai une théorie : tu es la personne la plus intéressante ici. Aide-moi à le prouver.",
                "Le barman t'a montrée quand j'ai demandé qui valait la conversation. Confirmé ?",
            ],
        },
        "sweet": {
            "en": [
                "Your laugh travels well. Just wanted to say that.",
                "You and your friends look like the best table in the bar.",
                "Hope your night's going well — felt rude not to say hi.",
            ],
            "fr": [
                "Ton rire traverse la salle. Je voulais juste te le dire.",
                "Toi et tes amies, c'est la meilleure table du bar.",
                "J'espère que ta soirée se passe bien — ça aurait été impoli de pas venir.",
            ],
        },
    },
    "restaurant": {
        "funny": {
            "en": [
                "Quick — what's good here? My waiter looks judgmental.",
                "If you tell me the dessert is mid, I'll trust you with my life.",
                "I came here for food and stayed for the unexpected eye contact.",
            ],
            "fr": [
                "Vite — qu'est-ce qui est bon ici ? Mon serveur a l'air sévère.",
                "Si tu me dis que le dessert est moyen, je te confie ma vie.",
                "Je suis venu pour manger, je reste pour le regard inattendu.",
            ],
        },
        "romantic": {
            "en": [
                "The candlelight isn't doing much. You don't need it.",
                "I'd ask to share dessert, but I'd really just like to share the next hour.",
                "Best meal I've had this week, and you're not even on the menu.",
            ],
            "fr": [
                "La bougie sert à rien. T'en as pas besoin.",
                "Je te proposerais de partager le dessert, mais je préfère partager l'heure suivante.",
                "Meilleur repas de la semaine, et t'es même pas sur la carte.",
            ],
        },
        "casual": {
            "en": [
                "Have you tried the special? Trying to decide.",
                "First time eating here? Wondering if I should come back.",
                "Honest review — was the bread as good as it looked?",
            ],
            "fr": [
                "T'as goûté le plat du jour ? J'hésite.",
                "Première fois ici ? Je me demande si je reviens.",
                "Avis honnête — le pain était aussi bon qu'il en avait l'air ?",
            ],
        },
        "bold": {
            "en": [
                "I'd love to know your name before our tables turn.",
                "Sliding in: would you join me at my table for one drink?",
                "I came over because I'd hate to leave wondering.",
            ],
            "fr": [
                "J'aimerais ton prénom avant qu'on parte chacun de notre côté.",
                "Je tente : tu me rejoins à ma table pour un verre ?",
                "Je viens te voir parce que je détesterais partir avec des regrets.",
            ],
        },
        "witty": {
            "en": [
                "Your wine pairing tells me you're either a connoisseur or a chaos agent. Which?",
                "Your menu choice is interesting. I'd love to interrogate it.",
                "Two-second pitch: skip dessert, get coffee with me?",
            ],
            "fr": [
                "Ton accord vin me dit soit que tu es connaisseuse soit que tu sèmes le chaos. Lequel ?",
                "Ton choix dans la carte est intéressant. J'aimerais l'interroger.",
                "Pitch de 2 secondes : on saute le dessert, on prend un café ensemble ?",
            ],
        },
        "sweet": {
            "en": [
                "Hope your meal's amazing — you deserve a good night.",
                "Just wanted to say your table looks like the happiest one here.",
                "Felt rude not to compliment your style on the way past.",
            ],
            "fr": [
                "J'espère que ton repas est top — tu mérites une bonne soirée.",
                "Je voulais juste dire que ta table a l'air la plus heureuse de la salle.",
                "Ça aurait été impoli de pas te complimenter sur ton style en passant.",
            ],
        },
    },
    "bookstore": {
        "funny": {
            "en": [
                "Quick survey: that book you're holding — life-changing or shelf-decorator?",
                "I'm pretending to know about books. You looked authoritative.",
                "Statistically, people in bookstores are 73% more dangerous. You confirm this.",
            ],
            "fr": [
                "Petit sondage : ce livre que tu tiens — il change la vie ou il décore l'étagère ?",
                "Je fais semblant de m'y connaître. T'avais l'air d'autorité.",
                "Statistiquement, les gens en librairie sont 73% plus dangereux. Tu confirmes.",
            ],
        },
        "romantic": {
            "en": [
                "I came in for a book. I'd leave with your number happily.",
                "If you'd recommend me one book, I'd read it in your voice.",
                "Of all the chapters in this place, you're the one I want to read.",
            ],
            "fr": [
                "Je suis venu pour un livre. Je repartirais volontiers avec ton numéro.",
                "Si tu me recommandais un livre, je le lirais dans ta voix.",
                "Parmi tous les chapitres ici, c'est toi que je veux lire.",
            ],
        },
        "casual": {
            "en": [
                "Recommend me something? I'm in a reading slump.",
                "Have you read that one? Genuinely curious.",
                "What section do you usually live in?",
            ],
            "fr": [
                "Tu me recommandes un truc ? Je suis dans un creux de lecture.",
                "Tu as lu celui-là ? Vraie curiosité.",
                "Quelle section tu hantes habituellement ?",
            ],
        },
        "bold": {
            "en": [
                "Bookstore rule: if I don't ask your name, I lose access. So — your name?",
                "Coffee around the corner? I want a chapter, not a paragraph.",
                "I noticed you. I'm acting on it. Hi.",
            ],
            "fr": [
                "Règle de la librairie : si je demande pas ton prénom, je perds. Alors — ton prénom ?",
                "Un café au coin ? Je veux un chapitre, pas un paragraphe.",
                "Je t'ai remarquée. Je passe à l'action. Salut.",
            ],
        },
        "witty": {
            "en": [
                "I judge people by their book choice. Yours is dangerous. Confirm?",
                "Two truths and a lie about your reading habits. Go.",
                "I'd guess you're the type to underline. Am I close?",
            ],
            "fr": [
                "Je juge les gens à leurs livres. Le tien est dangereux. Tu confirmes ?",
                "Deux vérités et un mensonge sur tes lectures. Vas-y.",
                "Je parierais que tu surlignes. Je suis proche ?",
            ],
        },
        "sweet": {
            "en": [
                "Your taste is impressive — felt like I should say it.",
                "Hope you find a good one today.",
                "You make this place feel quieter, in a good way.",
            ],
            "fr": [
                "Ton goût est impressionnant — je devais le dire.",
                "J'espère que tu trouves un bon livre aujourd'hui.",
                "Tu rends cet endroit plus calme, dans le bon sens.",
            ],
        },
    },
    "concert": {
        "funny": {
            "en": [
                "If we're both pretending to know all the lyrics, we should team up.",
                "The opener was bad and we both knew it. We should be friends.",
                "Quick — name a song. If we agree, we have to talk afterwards.",
            ],
            "fr": [
                "Si on fait semblant tous les deux de connaître les paroles, on devrait s'allier.",
                "La première partie était mauvaise et on le savait tous les deux. On devrait être amis.",
                "Vite — cite une chanson. Si on est d'accord, on parle après.",
            ],
        },
        "romantic": {
            "en": [
                "Crowd of thousands and somehow you're the only person I'm seeing.",
                "Best song of the night was the one you sang along to.",
                "If this set ends, I'd love to keep the night going with you.",
            ],
            "fr": [
                "Des milliers de personnes et tu es la seule que je vois.",
                "La meilleure chanson de la soirée, c'était celle que tu chantais.",
                "Si le concert se termine, j'aimerais prolonger la soirée avec toi.",
            ],
        },
        "casual": {
            "en": [
                "Is this your first time seeing them live?",
                "Who'd you come with? My friends bailed last minute.",
                "What's your favorite song of theirs?",
            ],
            "fr": [
                "Première fois que tu les vois en live ?",
                "Tu es venue avec qui ? Mes amis m'ont lâché à la dernière minute.",
                "C'est quoi ta chanson préférée d'eux ?",
            ],
        },
        "bold": {
            "en": [
                "I noticed you between songs and I'm not waiting for the encore. Hi.",
                "Tell me your name before the next song so I can dedicate it to you.",
                "Skip the small talk: drink after the show?",
            ],
            "fr": [
                "Je t'ai remarquée entre deux chansons et j'attendrai pas le rappel. Salut.",
                "Dis-moi ton prénom avant la prochaine chanson, je te la dédicace.",
                "On saute le bla-bla : un verre après le show ?",
            ],
        },
        "witty": {
            "en": [
                "Your dance moves are evidence of taste. I respect it.",
                "Quick test: scream the chorus with me on the next one. Pass = friendship.",
                "I have a feeling you've seen better concerts. Tell me about one?",
            ],
            "fr": [
                "Tes pas de danse prouvent ton bon goût. Je respecte.",
                "Test : tu cries le refrain avec moi sur la prochaine. Réussi = amitié.",
                "Je sens que t'as vu de meilleurs concerts. Tu m'en racontes un ?",
            ],
        },
        "sweet": {
            "en": [
                "Glad I'm sharing this with strangers like you. Felt like a good night.",
                "You sing along like someone who actually loves the music. Beautiful.",
                "Hope this is the best concert of your year.",
            ],
            "fr": [
                "Content de partager ça avec des inconnues comme toi. Belle soirée.",
                "Tu chantes comme quelqu'un qui aime vraiment la musique. C'est beau.",
                "J'espère que c'est le meilleur concert de ton année.",
            ],
        },
    },
    "gallery": {
        "funny": {
            "en": [
                "I have no idea what this piece means. You look like you do. Help.",
                "Quick — pretend you know this artist, my friend's about to ask.",
                "I'm here for the free wine, but you're a better reason to stay.",
            ],
            "fr": [
                "J'ai aucune idée de ce que veut dire cette œuvre. Toi t'as l'air de savoir. Aide-moi.",
                "Vite — fais comme si tu connaissais cet artiste, mon ami va demander.",
                "Je suis venu pour le vin gratuit, mais tu es une meilleure raison de rester.",
            ],
        },
        "romantic": {
            "en": [
                "This whole place is art, and somehow you're still the best part.",
                "I'd buy a painting just to remember the way you looked at it.",
                "I came for the exhibit. I'm staying for the conversation I'm hoping to have.",
            ],
            "fr": [
                "Tout ici est de l'art, et pourtant tu es encore la meilleure partie.",
                "J'achèterais une toile juste pour me souvenir de ton regard dessus.",
                "Je suis venu pour l'expo. Je reste pour la conversation que j'espère.",
            ],
        },
        "casual": {
            "en": [
                "What do you think of this one? Genuinely curious.",
                "Have you been to other shows here? Worth coming back?",
                "Are you an artist or just appreciator?",
            ],
            "fr": [
                "Tu en penses quoi de celle-ci ? Vraie curiosité.",
                "Tu es venue à d'autres expos ici ? Ça vaut le coup de revenir ?",
                "Tu es artiste ou simple amatrice ?",
            ],
        },
        "bold": {
            "en": [
                "I'd ask the artist to introduce us, but I'd rather just say hi myself.",
                "After this exhibit — coffee?",
                "Direct ask: your name and ten minutes of conversation?",
            ],
            "fr": [
                "Je demanderais à l'artiste de nous présenter, mais je préfère dire salut moi-même.",
                "Après l'expo — un café ?",
                "Demande directe : ton prénom et dix minutes de conversation ?",
            ],
        },
        "witty": {
            "en": [
                "You looked at that piece like you've decoded it. Want to share?",
                "I'd rate this exhibit a 7. You being here, 10. Math works.",
                "Galleries make me overthink. You're a refreshing distraction.",
            ],
            "fr": [
                "T'as regardé cette œuvre comme si tu l'avais décodée. Tu partages ?",
                "Je donne 7 à cette expo. Toi présente, 10. Le calcul tient.",
                "Les galeries me font trop réfléchir. Tu es une bonne distraction.",
            ],
        },
        "sweet": {
            "en": [
                "Your eye for detail is beautiful. Just wanted to say.",
                "You make even the boring pieces look interesting.",
                "Hope you find one that moves you tonight.",
            ],
            "fr": [
                "Ton sens du détail est beau. Je voulais juste le dire.",
                "Tu rends même les œuvres ennuyeuses intéressantes.",
                "J'espère que tu en trouves une qui te touche ce soir.",
            ],
        },
    },
    "coworking": {
        "funny": {
            "en": [
                "Quick — is this the WiFi password section? I'm pretending to be productive.",
                "Your laptop stickers tell me you're either a developer or a chaos agent.",
                "I came here to work, but I keep getting distracted by competence.",
            ],
            "fr": [
                "Vite — c'est ici le mot de passe WiFi ? Je fais semblant d'être productif.",
                "Tes stickers de laptop me disent que tu es soit dev soit semeuse de chaos.",
                "Je suis venu pour bosser, mais la compétence me distrait.",
            ],
        },
        "romantic": {
            "en": [
                "You make this place look like a Pinterest board. Hi.",
                "I'd rather not work, but talking to you sounds like a great deliverable.",
                "Of all the desks in here — sitting near you was the best decision.",
            ],
            "fr": [
                "Tu rends cet endroit digne d'un Pinterest. Salut.",
                "Je préfère pas bosser, mais te parler serait un super livrable.",
                "Parmi tous les bureaux — m'asseoir près de toi était la meilleure décision.",
            ],
        },
        "casual": {
            "en": [
                "Mind sharing this outlet? I'm at 3%.",
                "Are you a regular? Wondering about the best hours to work here.",
                "What are you working on? You look focused.",
            ],
            "fr": [
                "Tu me partages la prise ? Je suis à 3%.",
                "Tu es habituée ? Je me demande les meilleures heures pour bosser ici.",
                "Tu bosses sur quoi ? T'as l'air concentrée.",
            ],
        },
        "bold": {
            "en": [
                "Coffee break in 10? My excuse to talk to you.",
                "I'm asking: lunch break together?",
                "Your focus is intimidating. Want to redirect it for five minutes?",
            ],
            "fr": [
                "Pause café dans 10 ? C'est mon excuse pour te parler.",
                "Je demande : pause déjeuner ensemble ?",
                "Ta concentration est intimidante. Tu la redirige cinq minutes ?",
            ],
        },
        "witty": {
            "en": [
                "I judge people by their browser tab count. You look reasonable. Suspicious.",
                "Your typing speed is poetic. Not exaggerating.",
                "I have a theory you're more fun than your laptop suggests.",
            ],
            "fr": [
                "Je juge les gens à leur nombre d'onglets. Tu es raisonnable. Suspect.",
                "Ta vitesse de frappe est poétique. Sans exagération.",
                "J'ai une théorie : tu es plus marrante que ton laptop laisse penser.",
            ],
        },
        "sweet": {
            "en": [
                "Hope your work day's going well. You make this place feel calmer.",
                "Just wanted to compliment your setup — looks pro.",
                "Felt rude not to introduce myself before I left.",
            ],
            "fr": [
                "J'espère que ta journée se passe bien. Tu rends cet endroit plus calme.",
                "Je voulais te complimenter sur ton setup — ça fait pro.",
                "Ça aurait été impoli de partir sans me présenter.",
            ],
        },
    },
    "wedding": {
        "funny": {
            "en": [
                "Bride's side or groom's side — and which one has better dance moves?",
                "Quick — pretend we're old friends, my aunt is judging me.",
                "I came for the open bar. I'm staying for the unexpected chemistry.",
            ],
            "fr": [
                "Côté mariée ou côté marié — et qui danse le mieux ?",
                "Vite — fais comme si on était de vieux amis, ma tante me juge.",
                "Je suis venu pour le bar ouvert. Je reste pour l'alchimie inattendue.",
            ],
        },
        "romantic": {
            "en": [
                "If this wedding is romance training, you'd be the lesson worth taking.",
                "I'd have to be made of stone not to come over and say hi.",
                "Of everyone here, I want to know your story most.",
            ],
            "fr": [
                "Si ce mariage est un cours de romance, tu es la leçon à retenir.",
                "Il faudrait que je sois en pierre pour pas venir te dire salut.",
                "De tout le monde ici, c'est ton histoire que je veux le plus connaître.",
            ],
        },
        "casual": {
            "en": [
                "How do you know the couple?",
                "Beautiful ceremony, right? Loved the speeches.",
                "Save me from this small talk — what's your story?",
            ],
            "fr": [
                "Tu connais le couple comment ?",
                "Belle cérémonie, hein ? J'ai adoré les discours.",
                "Sauve-moi de cette conversation polie — c'est quoi ton histoire ?",
            ],
        },
        "bold": {
            "en": [
                "I'd be a fool not to ask — dance with me?",
                "Your name and the next slow song. Both sound great.",
                "Weddings make me brave. So: hi.",
            ],
            "fr": [
                "Je serais bête de pas te le demander — tu danses avec moi ?",
                "Ton prénom et la prochaine slow. Les deux sonnent bien.",
                "Les mariages me rendent courageux. Alors : salut.",
            ],
        },
        "witty": {
            "en": [
                "Your dancing tells me you've been to better weddings. Tell me about one.",
                "I'm guessing you're the most interesting cousin. Confirm or deny.",
                "Open bar plus you equals dangerous decisions. I'm into it.",
            ],
            "fr": [
                "Tu danses comme quelqu'un qui a vu de meilleurs mariages. Raconte.",
                "Je parie que tu es la cousine la plus intéressante. Confirmation ?",
                "Bar ouvert + toi = décisions dangereuses. Ça me va.",
            ],
        },
        "sweet": {
            "en": [
                "You look beautiful tonight — I had to say it.",
                "Hope you're enjoying it as much as you look like you are.",
                "Genuinely glad to share a table with you.",
            ],
            "fr": [
                "Tu es magnifique ce soir — je devais le dire.",
                "J'espère que tu profites autant que tu en as l'air.",
                "Sincèrement content de partager une table avec toi.",
            ],
        },
    },
    "hotel": {
        "funny": {
            "en": [
                "Quick — is the WiFi password 'guest' or are we both about to lie to the front desk?",
                "Lobby small talk is criminal. Let's commit a better conversation.",
                "I came down here to escape my room. You're a better view than the lobby.",
            ],
            "fr": [
                "Vite — le mot de passe WiFi c'est 'guest' ou on va mentir tous les deux à la réception ?",
                "Le bla-bla de hall, c'est criminel. Faisons une vraie conversation.",
                "Je suis descendu pour m'évader de ma chambre. Tu es une meilleure vue que ce hall.",
            ],
        },
        "romantic": {
            "en": [
                "Of all the lobbies in all the cities — somehow we're sharing this one.",
                "I'd offer to share the elevator, but I'd rather share dinner.",
                "Travel makes you brave. So I'm coming over to say it: you're stunning.",
            ],
            "fr": [
                "Parmi tous les halls de toutes les villes — on partage celui-là.",
                "Je te proposerais de partager l'ascenseur, mais je préfère le dîner.",
                "Les voyages rendent courageux. Alors je viens te le dire : tu es magnifique.",
            ],
        },
        "casual": {
            "en": [
                "Are you traveling for work or pleasure?",
                "How long are you in town for?",
                "Any restaurant recommendations? Concierge gave me tourist traps.",
            ],
            "fr": [
                "Tu voyages pour le boulot ou le plaisir ?",
                "Tu restes combien de temps en ville ?",
                "Une reco de resto ? Le concierge m'a filé des pièges à touristes.",
            ],
        },
        "bold": {
            "en": [
                "We're both staying somewhere we don't live. Drinks at the bar?",
                "I won't be in this city long. Worth the conversation now.",
                "Be honest — would dinner together beat room service?",
            ],
            "fr": [
                "On dort tous les deux dans une ville qui n'est pas la nôtre. Un verre au bar ?",
                "Je suis pas longtemps ici. La conversation vaut le coup maintenant.",
                "Honnêtement — un dîner ensemble bat le room service ?",
            ],
        },
        "witty": {
            "en": [
                "Your luggage looks well-traveled. Tell me your favorite stop.",
                "Hotel lobbies are for goodbyes and beginnings. Which one are we?",
                "I'd guess you check in lighter than you check out. Am I right?",
            ],
            "fr": [
                "Tes bagages ont l'air voyageurs. Ta destination préférée ?",
                "Les halls d'hôtel, c'est pour les adieux ou les commencements. On est lequel ?",
                "Je parierais que tu arrives plus légère que tu pars. Vrai ?",
            ],
        },
        "sweet": {
            "en": [
                "Hope this trip is treating you well.",
                "You make this lobby feel less anonymous.",
                "Wishing you a great stay — felt rude not to say it.",
            ],
            "fr": [
                "J'espère que ce voyage se passe bien pour toi.",
                "Tu rends ce hall moins anonyme.",
                "Bon séjour — ça aurait été impoli de pas te le dire.",
            ],
        },
    },
    "transit": {
        "funny": {
            "en": [
                "Quick — this train smells weird. Are you the witness or the suspect?",
                "Statistically, the most interesting person in any subway car is the one reading a real book. So — hi.",
                "If we both get off at the next stop, fate's getting bold.",
            ],
            "fr": [
                "Vite — ce train sent bizarre. Tu es témoin ou suspecte ?",
                "Statistiquement, la personne la plus intéressante d'une rame, c'est celle qui lit un vrai livre. Salut.",
                "Si on descend tous les deux au prochain arrêt, le destin pousse fort.",
            ],
        },
        "romantic": {
            "en": [
                "Of all the cars on this train, I'm grateful you picked this one.",
                "I'd miss my stop happily if it meant a longer conversation.",
                "Eye contact across a subway is rare. I'm not letting it go to waste.",
            ],
            "fr": [
                "De toutes les rames de ce train, je suis content que tu aies choisi celle-là.",
                "Je raterais volontiers mon arrêt pour prolonger la conversation.",
                "Un regard dans le métro, c'est rare. Je vais pas le gâcher.",
            ],
        },
        "casual": {
            "en": [
                "Quick question — does this train go all the way downtown?",
                "Long commute? You look way too patient.",
                "What are you reading? I need a new book.",
            ],
            "fr": [
                "Petite question — ce train va jusqu'au centre ?",
                "Long trajet ? Tu as l'air trop patiente.",
                "Tu lis quoi ? J'ai besoin d'un nouveau livre.",
            ],
        },
        "bold": {
            "en": [
                "Three stops to ask: name, number, or both?",
                "I'm getting off in two stops. Worth asking now.",
                "Skip the smile-then-look-away thing — let's actually talk.",
            ],
            "fr": [
                "Trois arrêts pour demander : prénom, numéro, ou les deux ?",
                "Je descends dans deux arrêts. Ça vaut le coup de demander maintenant.",
                "On saute le sourire-puis-regarde-ailleurs — on parle vraiment.",
            ],
        },
        "witty": {
            "en": [
                "Your headphones look serious. Either dangerous taste or great taste.",
                "I'd guess your destination by your shoes. May I?",
                "Quick test — recommend a song for this commute.",
            ],
            "fr": [
                "Tes écouteurs ont l'air sérieux. Soit goût dangereux, soit excellent goût.",
                "Je pourrais deviner ta destination à tes chaussures. Je tente ?",
                "Test : recommande-moi une chanson pour ce trajet.",
            ],
        },
        "sweet": {
            "en": [
                "Hope your day's going well — felt like I should say it.",
                "Your calm energy is appreciated, especially on this train.",
                "Have a good rest of your journey.",
            ],
            "fr": [
                "J'espère que ta journée se passe bien — je voulais le dire.",
                "Ton énergie calme est appréciée, surtout dans ce train.",
                "Bon reste de trajet à toi.",
            ],
        },
    },
}


def build_seed_documents():
    """Flatten the LIBRARY into individual icebreaker documents."""
    docs = []
    for cat_id, tone_map in LIBRARY.items():
        for tone, lang_map in tone_map.items():
            for lang, lines in lang_map.items():
                for text in lines:
                    docs.append({
                        "category": cat_id,
                        "tone": tone,
                        "language": lang,
                        "text": text,
                    })
    return docs


def get_categories():
    return CATEGORIES


def get_tones():
    return TONES
