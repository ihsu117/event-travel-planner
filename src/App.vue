<script setup>
import { 
  PButton,
  PDropDown,
  PTextField,
  PEvent,
  PFlight,
  PProfilePic,
  PFinanceBlock 
} from '@poseidon/lib/components'
import '@poseidon/lib/styles/index.css'
</script>

<template>
  <div class="display-div">
    <h1>Poseidon Components</h1>
    <h2>PButton Component Styles</h2>
    <div>
      <p>design="login"</p>
      <PButton design="login" label="Login" />
    </div>

    <div>
      <p>design="gradient"</p>
      <PButton design="gradient" label="Book Your Flight Here Now!" />
    </div>

    <div>
      <p>design="gradient-small"</p>
      <PButton design="gradient-small" label="Talk with me!" />
    </div>

    <div>
      <p>design="shop"</p>
      <PButton design="shop" label="Buy" />
    </div>

    <div>
      <h2>PDropDown</h2>
      <div class="p-dropdown__container">
        <PDropDown design="p-dropdown" dropDownLabel="Airlines" :options="['United', 'Delta', 'American', 'Spirit']" />
        <PDropDown design="p-dropdown" dropDownLabel="Price" :options="['Lowest', 'Highest']" />
        <PDropDown design="p-dropdown" dropDownLabel="Time" :options="['Earliest', 'Latest']" />
        <PDropDown design="p-dropdown" dropDownLabel="Class" :options="['Economy', 'Business', 'First']" />
      </div>
    </div>

    <div>
      <h2>PTextField</h2>
      <h3>Text Field</h3>
      <PTextField design="p-textfield" label="Enter Username" />
    </div>

    <div>
      <h2>PEvent</h2>
      <p>design="block"</p>
      <div class="p-event__container">
        <PEvent design="block" organization="Organization" event="Event 1" :startDate="new Date('2025-11-8')"
          :endDate="new Date('2025-11-12')"
          bgImage='https://images.unsplash.com/photo-1556743595-0c9952ae2645?q=80&w=2007&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' />
      </div>
      <p>design="header"</p>
      <PEvent design="header" organization="Organization" event="Event 1" :startDate="new Date('2025-11-8')"
        :endDate="new Date('2025-11-12')"
        bgImage='https://images.unsplash.com/photo-1556743595-0c9952ae2645?q=80&w=2007&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' />
    </div>

    <p>design="admin"</p>
    <p>design="finance"</p>

    <div>
      <h2>PFlight</h2>
      <div class="p-event__container">
        <PFlight design="block" :flightDate="new Date('2024-11-7')" flightDepTime="12:30" flightArrTime="14:45"
          origin="EWR" destination="ROC" seatNumber="3B" flightType="Nonstop" flightGate="41C" flightClass="Economy"
          :price=156 airline="United" />
      </div>
    </div>
    <p>design="shop"</p>
    <div class="p-event__container">
      <PFlight design="shop" :flightDate="new Date('2024-11-7')" flightDepTime="12:30" flightArrTime="14:45"
        origin="EWR" destination="ROC" seatNumber="3B" flightType="Nonstop" flightGate="41C" flightClass="Economy"
        :price=156 airline="United" />
    </div>
    <p>design="finance"</p>

    <div>
      <h2>PProfilePic</h2>
      <div>
        <p>design="small"</p>
        <PProfilePic design="small"
          profileImage='https://m.media-amazon.com/images/M/MV5BYzQ1ZDljZGEtNTliZC00ODkyLTgxODctNDQxNDRiZmI3ZmMyXkEyXkFqcGc@._V1_.jpg' />
        <p>design="big"</p>
        <PProfilePic design="big"
          profileImage='https://m.media-amazon.com/images/M/MV5BYzQ1ZDljZGEtNTliZC00ODkyLTgxODctNDQxNDRiZmI3ZmMyXkEyXkFqcGc@._V1_.jpg' />
      </div>
    </div>

    <div>
      <h2>PFinanceBlock</h2>
      <PFinanceBlock design="p-finance" name="Timothy Wagner" jobTitle="Finance Manager" email="TWagner49@gmail.com"
        phoneNum="246-123-5124"
        profileImage="https://m.media-amazon.com/images/M/MV5BYzQ1ZDljZGEtNTliZC00ODkyLTgxODctNDQxNDRiZmI3ZmMyXkEyXkFqcGc@._V1_.jpg" />
    </div>

  </div>

</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
