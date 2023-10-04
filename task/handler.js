import EsriDump from '@openaddresses/esri-dump';

for (const env of []) {
    if (!process.env[env]) throw new Error(`${env} Env Var Required`);
}

export async function handler(event) {
    for (const record of event.Records) {
        try {
            const event = JSON.parse(record.body);

            console.log(event);

            const esri = new EsriDump(event.url, {
                approach: 'iter',
                headers
            });

            esri.on('error', (err) => {
                throw err;
            }).on('service', (service) => {
                console.log(JSON.stringify(service));
            }).on('layer', (layer) => {
                console.log(JSON.stringify(layer));
            });

            await esri.discover();
        } catch (err) {
            throw err;
        }
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const res = await handler({
    });
}
