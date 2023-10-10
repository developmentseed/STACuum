<template>
<div>
    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class='card'>
                    <div class='card-header d-flex'>
                        <h1 class='card-title'>ESRI Server Ingest</h1>
                    </div>
                    <TablerLoading v-if='loading' desc='Submitting Server for Ingest'/>
                    <div v-else class='card-body'>
                        <div class='row g-2'>
                            <div class='col-12'>
                                <TablerInput label='Server Name' v-model='server.name'/>
                            </div>
                            <div class='col-12 mb-3'>
                                <TablerInput label='ESRI Server URL' v-model='server.url'/>
                            </div>
                            <div class='col-12 d-flex'>
                                <div class='ms-auto'>
                                    <button @click='submit' class='btn btn-primary'>Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <PageFooter/>
</div>
</template>

<script>
import PageFooter from './PageFooter.vue';
import {
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler'

export default {
    name: 'Ingest',
    components: {
        PageFooter,
    },
    data: function() {
        return {
            loading: false,
            server: {
                name: '',
                url: ''
            }
        }
    },
    methods: {
        async submit() {
            try {
                this.loading = true;
                await window.std('/ingest', {
                    method: 'POST',
                    body: this.server
                });
                this.loading = false;

                this.$router.push('/');
            } catch (err) {
                this.loading = false;
                throw err;
            }
        }
    },
    components: {
        TablerInput,
        TablerLoading,
        PageFooter
    }
}
</script>
