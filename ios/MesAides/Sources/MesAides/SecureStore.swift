import Foundation
import Security

/// Keychain-backed encrypted storage for user situation data.
/// All data stays on-device, encrypted by iOS Secure Enclave.
enum SecureStore {

    private static let service = "com.macaronsoftware.mesaides"

    static func save(_ situation: SituationForm) throws {
        let data = try JSONEncoder().encode(situation)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: "situation",
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw SecureStoreError.saveFailed(status)
        }
    }

    static func load() -> SituationForm? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: "situation",
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return try? JSONDecoder().decode(SituationForm.self, from: data)
    }

    static func delete() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: "situation"
        ]
        SecItemDelete(query as CFDictionary)
    }

    enum SecureStoreError: Error {
        case saveFailed(OSStatus)
    }
}
