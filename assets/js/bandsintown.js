const artistsAndAppIds = {
	'2ble-barrel': { 
		name: "2ble Barrel",
		link: "/2ble-barrel",
		artistId: "id_15628409", 
		appId: "b693f73cad3877e5d4d7a5542117afa7",
	}, 
	gus: {
		name: "GuS !",
		link: "/gus",
		artistId: "id_15628410",
		appId: "ccd70a2b8f0cadbf61be0d6e1559df0b",
	},
	'the-dillingers': {
		name: "The Dillingers",
		link: "/the-dillingers",
		artistId: "id_15628432",
		appId: "04aa449760082e70bc18eb1e6d1eae9d",
	},
};

const fetchArtistEvents = async (artistId, appId, date) => {
	const response = await fetch(`https://rest.bandsintown.com/artists/${artistId}/events?app_id=${appId}&date=${date}`);
        return response.json();
};

const displayConcerts = async () => {
        const concertsDiv = document.getElementById('bandsintown');
	const date = concertsDiv.dataset.date || 'upcoming';
	const band = concertsDiv.dataset.band && artistsAndAppIds[concertsDiv.dataset.band];
	const bands = band && [band] || Object.values(artistsAndAppIds);

	const allEvents = [];
	const artistNames = {};
        for (const { name, link, artistId, appId } of bands) {
        	const events = await fetchArtistEvents(artistId, appId, date);
		for (let event of events) {
			if (event.artist) {
				artistNames[name] =  event.artist.name;
			}
			allEvents.push({ myName: name, myLink: link, artistName: artistNames[name], ...event });
		}
	}
	allEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
	
        allEvents.forEach(event => {
		//console.log(event);

		const eventDate = new Date(event.datetime);
		if (eventDate < Date.now()) {
			event.inThePast = true;
		}
		event.formattedDate = `${eventDate.toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', year: 'numeric', day: 'numeric' })} @ ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}`;
		if (event.venue.country !== 'France') {
			event.formattedLocation = `${event.venue.city}, ${event.venue.country}`;
		} else if (event.venue.postal_code) {
			event.formattedLocation = `${event.venue.city} (${event.venue.postal_code.substring(0, 2)})`;
		} else {
			event.formattedLocation = event.venue.city;
		}
		if (event.lineup && event.lineup.length > 1) {
			// search other band in lineup
			const otherBands = [];
			for (let band of event.lineup) {
				if (band !== event.artistName) {
					otherBands.push(band);
				}
			}
			event.formattedLineup = otherBands.join(' & ');
		}

		if (event.offers.length > 0) {
			for (let offer of event.offers) {
				if (offer.type === 'Tickets') {
					event.myTickets = offer;
					break;
				}
			}
		}
			console.log(event);

                const eventDiv = document.createElement('div');
                eventDiv.classList.add('bandsintown-event');
                eventDiv.innerHTML = `
		<div class="row aln-middle gtr-50 gtr-uniform">
			<div class="bandsintown-details ${date === 'past' ? 'col-12' : 'col-10 col-8-small col-12-xsmall'}">
				<div class="row">
                			${!band ? '<span class="col-12"><span class="bandsintown-band"><a href="' + event.myLink + '">' + event.myName + '</a>' + (event.formattedLineup ? '<span class="bandsintown-lineup"> (avec ' + event.formattedLineup + ')</span>' : '') + '</span></span>' : ''}
					<span class="bandsintown-date col-4 col-12-small"><a href="${event.url}" rel="noopener" target="_blank">${event.formattedDate}</a></span>
					<span class="bandsintown-venue col-4 col-8-small col-12-xsmall">${event.venue.name}</span>
					<span class="${date !== 'past' ? 'bandsintown-location' : 'bandsintown-location-last'} col-4 col-4-small col-12-xsmall">${event.formattedLocation}</span>
                			${band && event.formattedLineup ? '<span class="bandsintown-lineup col-12">(avec ' + event.formattedLineup + ')</span>' : ''}
				</div>
			</div>
			${date !== 'past' ? ('<div class="bandsintown-prices col-2 col-4-small col-12-xsmall">' + (event.inThePast ? '' : (event.free ? 'GRATUIT' : (event.myTickets ? '<span class="bandsintown-tickets"><a class="button" href="' + event.myTickets.url  + '" rel="noopener" target="_blank">Réserver</a></span>' : 'SUR PLACE'))) + '</div>') : ''}
		</div>
		`;
                //   ${event.venue.name}, ${event.venue.city}, ${event.venue.country}<br>
                //   ${new Date(event.datetime).toLocaleString()}
                //`;
                concertsDiv.appendChild(eventDiv);
        });
                
	//concertsDiv.appendChild(artistDiv);
};

displayConcerts();
