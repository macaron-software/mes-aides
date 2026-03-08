import SwiftUI

/// Language selector dropdown (40 locales)
struct LanguagePicker: View {
    @AppStorage("appLocale") private var locale = "fr"

    private let locales: [(code: String, name: String)] = [
        ("fr", "Francais"), ("en", "English"), ("ar", "العربية"),
        ("es", "Espanol"), ("pt", "Portugues"), ("de", "Deutsch"),
        ("it", "Italiano"), ("nl", "Nederlands"), ("pl", "Polski"),
        ("ru", "Русский"), ("uk", "Украiнська"), ("tr", "Turkce"),
        ("ro", "Romana"), ("zh", "中文"), ("zh-TW", "繁體中文"),
        ("ja", "日本語"), ("ko", "한국어"), ("hi", "हिन्दी"),
        ("bn", "বাংলা"), ("ur", "اردو"), ("fa", "فارسی"),
        ("he", "עברית"), ("th", "ภาษาไทย"), ("vi", "Tieng Viet"),
        ("id", "Bahasa Indonesia"), ("ms", "Bahasa Melayu"),
        ("tl", "Filipino"), ("sw", "Kiswahili"), ("ha", "Hausa"),
        ("so", "Soomaali"), ("yo", "Yoruba"), ("am", "አማርኛ"),
        ("sv", "Svenska"), ("da", "Dansk"), ("fi", "Suomi"),
        ("cs", "Cestina"), ("hu", "Magyar"), ("el", "Ελληνικα"),
        ("bg", "Български"), ("sk", "Slovencina"),
    ]

    var body: some View {
        Menu {
            ForEach(locales, id: \.code) { l in
                Button(l.name) { locale = l.code }
            }
        } label: {
            Label(locale.uppercased(), systemImage: "globe")
                .font(.caption.bold())
        }
    }
}
