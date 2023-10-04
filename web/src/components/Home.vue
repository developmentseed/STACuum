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
                    <template v-if='loading.list'>
                        <TablerLoading desc='Loading Servers'/>
                    </template>
                    <template v-else-if='!list.servers.length'>
                        <TablerNone label='Servers' :create='false'/>
                    </template>
                    <table v-else class="table table-hover card-table table-vcenter">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Url</th>
                                <th>LastCrawled</th>
                            </tr>
                        </thead>
                        <tbody>
                              <tr :key='server.id' v-for='server in list.server'>
                                  <td v-text='server.name'></td>
                                  <td v-text='server.url'></td>
                                  <td v-text='server.last'></td>
                              </tr>
                          </tbody>
                      </table>
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
    TablerNone,
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
            loading: {
                list: true
            },
            list: {
                total: 0,
                servers: []
            }
        }
    },
    mounted: async function() {
        await this.getStatus();
    },
    methods: {
        async getStatus() {
            this.loading.list = true;
            this.list = await window.std('/ingest');
            this.loading.list = false;
        }
    },
    components: {
        Status,
        PlusIcon,
        RefreshIcon,
        TablerInput,
        TablerNone,
        TablerLoading,
        PageFooter
    }
}
</script>
