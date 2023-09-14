import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { COLORS } from '../constants'

const FAQ = () => {
    return <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>
            <View>
                <Text style={styles.h1}>Frequently Asked Questions</Text>

                <Text>Last Updated: 27th of August, 2023</Text>
                <Text>Contact: info@pawretriever.com</Text>

                <Text style={[styles.h2, styles.topSpacer]}>Introduction</Text>

                <Text style={styles.paragraphSpacer}>
                    Paw Retriever is a website (and soon also an app) that allows people to search for dogs 
                    all around the world. With it's ability to filter through set inputs, you would be able 
                    to track down a German Shepherd in your region if you ever saw one roaming around freely 
                    on the street, then open it's administrative user's profile page and message them about it.
                </Text>

                <Text style={styles.paragraphSpacer}>
                    Ever wished it was possible to create a family tree for your dog? Paw Retriever's litters 
                    have you covered. You can create one if you've added the litter's mother to our database. 
                    After doing so, you can add a father and puppies to it. Simultaneously, other users are 
                    able to propose their dogs as the father and as puppies of the litter, which you could 
                    then accept. Each dog's instant family tree is listed on their profile page, which also 
                    includes all other provided information about them - even socials, such as links to the 
                    dog's own instagram, facebook, youtube and tiktok.
                </Text>

                <Text>
                    In addition, you can make and look through advertisements. Looking to buy or sell a dog? Perhaps 
                    you have a pure breed female dog and wish for it to have a litter of the same breed? All 
                    that and more is possible in Paw Retriever.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>Users</Text>

                <Text style={styles.h3}>Register</Text>

                <Text style={styles.paragraphSpacer}>
                    Anyone can register an account on our website. You will need to provide a username, 
                    a password, an email and a location. Optionally, you can write in your bio while creating 
                    an account as well.
                </Text>

                <Text>
                    Once you've pressed on the Register button, an email verification link will be sent to the 
                    provided email. You'll then need to click on the Verify Email button or go to the link provided 
                    to verify it. After you've done so, you will be able to login to the website.
                </Text>

                <Text style={[styles.h3, styles.smallSpacer]}>Login</Text>

                <Text style={styles.paragraphSpacer}>
                    Once on the login page, you can enter either your email or username and password, optionally 
                    you can choose wether you'd like to Stay Logged In. Without enabling the option, your account 
                    will be automatically logged out each time you close the website's browser tab. You will then have 
                    to login each time you visit the site on a new tab.
                </Text>

                <Text>
                    Once you're logged in, you will be able to edit your account information, including adding or 
                    updating your profile picture, which will be transformed to have a 1:1 ratio. If you delete 
                    your account, all of the related dogs, advertisements and litters will also be deleted with it.
                </Text>

                <Text style={[styles.h3, styles.smallSpacer]}>User Page</Text>

                <Text style={styles.paragraphSpacer}>
                    When you click on either the user icon on desktop or My Profile under the mobile menu, you will 
                    be taken to your account's profile page, which is available to view for everyone, even those not 
                    logged in.
                </Text>

                <Text style={styles.paragraphSpacer}>
                    Your user profile will contain your username, a profile picture (if you have uploaded one), the 
                    location you've provided and your bio (if you have written one). Additionally, any active advertisement 
                    you have posted will be shown under your personal info, followed by all the dogs you currently administrate 
                    on the page.
                </Text>

                <Text>
                    The information you see on a user's page will vary. If you're logged in and are on your own profile, you 
                    have an Edit Profile button at the top. However, when another user visits your page, they will have an 
                    option to message your and an option to propose transferring any of their dogs to you. In addition, if 
                    you have proposed any of your dogs to them, they will have the option to accept said dogs on your page. 
                    Other users also have the option to report your profile to the moderators of the website.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>Dogs</Text>

                <Text style={styles.h3}>Add Your Dog to the Database</Text>

                <Text>
                    There is no limit to how many dogs you can add to the database. Simply go to the Dogs page 
                    and press on Add a New Dog. You will then need to input information about the dog, with fields 
                    marked with the symbol * being required. The inputs are controlled, so as long as you have written 
                    or chosen anything out of the required fields, you will be able to Save the dog to the database.
                </Text>

                <Text style={[styles.h3, styles.smallSpacer]}>Edit the Dog's Profile</Text>

                <Text>
                    A similar form to adding a new dog, with the exception that you won't be able to change fields that 
                    shouldn't be changed, such as date of birth. In addition, you can also add the dog's socials and 
                    upload the dog's profile picture. That picture will be transformed to have a 1:1 ratio if it doesn't 
                    already have that. Here you will also have the option to delete the dog from our database, which in 
                    addition will also delete all of the dog's litters.
                </Text>

                <Text style={[styles.h3, styles.smallSpacer]}>Dog Page</Text>

                <Text>
                    When clicking on a dog's name in the dogs' search page, or on any other page that has a link to a 
                    certain dog, you will be taken to the dog's profile page. It has all the information about the dog, 
                    including it's instant family tree, with the litter it is born to, all of it's siblings and parents 
                    from said litter and all of the litters that the dog is a parent to, together will all of those litters' 
                    puppies. If you are logged in as the user who administers the dog, you have the option to Edit the dog's 
                    information. Other users have the ability to Report your dog.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>Advertisements</Text>

                <Text style={styles.h3}>Posting an Advertisement</Text>

                <Text>
                    Currently the default homepage of Paw Retriever is the list of advertisements. You can view and filter 
                    through all advertisements, and if you're logged in, you have an option to Post an Advertisement. All 
                    inputs, apart from adding a picture and a region of the advertisement's location, are required. Ofcourse, 
                    when you make an advertisement for a Found or Lost dog, or item, the price and currency inputs will be 
                    disabled and therefore not required either.
                </Text>

                <Text style={[styles.h3, styles.smallSpacer]}>Edit an Advertisement</Text>

                <Text>
                    When on your own advertisement's page, you have the option to Edit it. The form is very similar to the 
                    form of adding a new advertisement, except it doesn't have fields that shouldn't be updated, such as 
                    the type of the advertisement. This is where you'll also be able to delete your advertisement if you wish 
                    to, although all advertisements will be deleted automatically 30 days after posting.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>Litters</Text>

                <Text style={styles.h3}>Adding a Litter</Text>

                <Text>
                    If you administer any female dogs that are at least 2 months old, you have the option to add a litter 
                    to their name. You must also choose the puppies' breed, which can be either mixed or the same breed as 
                    the mother. This will also determine which dogs may be added as the litter's father. You must also pick 
                    the amount of puppies that were born to the litter and the location in which they were born. The region 
                    is not required. Lastly, you must input the time of birth.
                </Text>

                <Text style={[styles.h3, styles.smallSpacer]}>Litter Page</Text>

                <Text style={styles.paragraphSpacer}>
                    When clicking on a litter's link either in the litters' list or through a dog's profile, you will be 
                    taken to the litter's page, which will have all the information about it, such as the litter's parents, 
                    when and where the litter was born and how many puppies it has. At the bottom, it has a link to each 
                    puppy that has been added to the litter.
                </Text>

                <Text>
                    If you have a puppy that has been born to the litter, you may propose your dog to be added to the litter. 
                    The administrator of the litter's mother must then approve it. If the administrator of the litter's mother 
                    is you, you can add suitable puppies immediately. Keep in mind that if the date of birth of your dog is not 
                    within 7 days of the litter's date of birth, you will not be able to add said dog. In addition, you can 
                    propose or add a father to the litter depending on wether you're the administrator of the litter's mother 
                    or not. If you are, this is the page where other users' proposals will appear as well - you may either 
                    accept or ignore them. Litters cannot be reported.
                </Text>

            </View>

            <View>
                <Text style={[styles.h1, {marginTop: 25}]}>Privacy Policy</Text>

                <Text>Last Updated: 27th of August, 2023</Text>

                <Text>
                    This Privacy Policy explains how Paw Retriever ("we," "us," or "our") collects, uses, 
                    and discloses information about users ("you" or "your") of the pawretriever.com website 
                    (the "Website"). By accessing or using the Website, you consent to the practices described 
                    in this Privacy Policy.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>Cookies</Text>

                <Text>
                    We use cookies and similar tracking technologies to enhance your experience on our Website. 
                    Cookies are small data files that are placed on your device when you visit a website. 
                    They allow us to recognize your browser and capture certain information.
                </Text>

                <Text style={[styles.h3, styles.smallSpacer]}>Essential Cookies</Text>

                <Text>
                    We use essential cookies that are necessary for the proper functioning of the Website. 
                    These cookies enable features such as user authentication and session management. 
                    They are used to keep you logged in if you choose the "Stay Logged In" option on the User Login page.
                </Text>

                <Text style={[styles.h3, styles.smallSpacer]}>Analytics Cookies</Text>

                <Text>
                    We may use analytics cookies to collect information about how you interact with our Website. 
                    This information helps us improve our services and enhance your browsing experience. 
                    Analytics cookies do not contain personal information and are used for statistical purposes only.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>User Login</Text>

                <Text>
                    When you use our user authentication feature to log in to the Website, 
                    we use cookies to maintain your login session. If you choose the "Stay Logged In" option, 
                    a cookie will be stored on your device to keep you logged in even after you close the browser tab.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>Advertising</Text>

                <Text>
                    While Paw Retriever does not currently display ads, we may introduce advertising from 
                    third-party networks in the future. These ads may use cookies and similar technologies 
                    to deliver relevant content and measure ad performance. We will update this Privacy Policy 
                    accordingly if and when we introduce advertising.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>Your Choices</Text>

                <Text>
                    You can manage your cookie preferences through your browser settings. 
                    You can choose to block or delete cookies, but this may impact your experience on the Website.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>Updates to this Privacy Policy</Text>

                <Text>
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, 
                    operational, or regulatory reasons. We encourage you to review this Privacy Policy periodically for any updates.
                </Text>

                <Text style={[styles.h2, styles.topSpacer]}>Contact Us</Text>

                <Text style={{marginBottom: 20}}>
                    If you have any questions about this Privacy Policy or your privacy rights, please contact us at info@pawretriever.com.
                </Text>

            </View>
        </View>
    </ScrollView>
}

const styles = StyleSheet.create({
    mainView: {
        paddingHorizontal: 10,
        marginBottom: 30,
        marginTop: 10,
    },
    h1: {
        fontSize: 25,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    h2: {
        fontSize: 20,
        marginBottom: 15,
        fontWeight: 'bold',
    },
    h3: {
        fontSize: 17,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    topSpacer: {
        marginTop: 15,
    },
    smallSpacer: {
        marginTop: 10,
    },
    paragraphSpacer: {
        marginBottom: 10,
    },
})

export default FAQ
