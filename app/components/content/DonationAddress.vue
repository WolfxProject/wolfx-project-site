<script setup lang="ts">
interface DonationAddressProps {
  label: string
  network: string
  address: string
}

const props = defineProps<DonationAddressProps>()
const { t } = useI18n()

const addressLabel = computed(() => `${props.label} (${props.network}) — ${t('donation.walletAddress')}`)
</script>

<template>
  <section
    class="donation-address"
    data-donation-address
  >
    <div class="donation-address__heading">
      <h2>{{ label }}</h2>
      <span>{{ network }}</span>
    </div>
    <div class="donation-address__value">
      <code
        tabindex="0"
        :aria-label="addressLabel"
      >{{ address }}</code>
      <CopyButton
        :value="address"
        :aria-label="addressLabel"
      />
    </div>
  </section>
</template>
