<template>
<div>
    <div class='page-body'>
        <div class='container-xl'>
            <div class='row row-deck row-cards'>
                <div class='card'>
                    <div class='card-header d-flex'>
                        <h1 class='card-title'>Ingested ESRI Servers</h1>
                        <div class='ms-auto btn-list'>
                            <RefreshIcon @click='getStatus' class='cursor-pointer'/>
                            <PlusIcon @click='$router.push("/edit")' class='cursor-pointer'/>
                        </div>
                    </div>
                    <div class='card-body'>
                        <TablerLoading v-if='loading'/>
                        <template v-else>
                            <div class='row'>
                                <div class='mx-2'>
                                    <div class='subheader'>Loaded Models</div>
                                </div>
                            </div>
                        </template>
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
import Status from './util/Status.vue';
import {
    TablerInput,
    TablerLoading
} from '@tak-ps/vue-tabler'

import {
    PlusIcon,
    RefreshIcon,
} from 'vue-tabler-icons';

export default {
    name: 'Home',
    components: {
        PageFooter,
    },
    data: function() {
        return {
            loading: true,
            status: {}
        }
    },
    mounted: async function() {
        await this.getStatus();
    },
    methods: {
        async getStatus() {
            this.loading = true;
            this.status = await window.std('/ingest');
            this.loading = false;
        }
    },
    components: {
        Status,
        PlusIcon,
        RefreshIcon,
        TablerInput,
        TablerLoading,
        PageFooter
    }
}
</script>
